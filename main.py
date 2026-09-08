import os
import numpy as np
from fastapi import FastAPI, HTTPException
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import onnxruntime as ort

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["https://research-topic-classification-gnn.onrender.com"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/")
def home():
  return {"message": "Server running successfully...."}


"""
  Dictionary to check each label along with corresponsing class
"""
CORA_CLASSES = {
  0: "Case_Based",
  1: "Generic_Algorithms",
  2: "Neural_Networks",
  3: "Probabilistic_Methods",
  4: "Reinforcement_Learning",
  5: "Rule_Learning",
  6: "Theory",
}

# Loading Model
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "simple_gcn_cora.onnx")
DATA_DIR = os.path.join(BASE_DIR, "data", "Planetoid")

model_session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])


"""
  REQUEST FORMAT - describes what JSON data we will get from the user
"""
class GraphPredictRequest(BaseModel):
  node_features: List[List[float]]
  edge_indices: Optional[List[List[int]]] = None


class CORANodeRequest(BaseModel):
  node_indices: List[int]


# Helper functions
def softmax(scores: np.ndarray):
  # Turns raw model scores into prob between 0 and 1
  shifted = scores - scores.max(axis=1, keepdims=True)
  exponential_scores = np.exp(shifted)
  return exponential_scores / exponential_scores.sum(axis=-1, keepdims=True)


def run_model(node_features: np.ndarray, edge_index: np.ndarray, node_indices_to_return):
  output = model_session.run(
    ["logits"],
    {
      "node_features": node_features.astype(np.float32),
      "edge_indices": edge_index.astype(np.int64)
    }
  )

  logits = output[0]
  probabilities = softmax(scores=logits)
  predicted_class = logits.argmax(axis=-1)

  results = []
  for i in node_indices_to_return:
    results.append({
      "node_index": i,
      "predicted_class_id": int(predicted_class[i]),
      "predicted_class_label": CORA_CLASSES[int(predicted_class[i])],
      "probabilities": probabilities[i].tolist(),
      "logits": logits[i].tolist(),
    })

  return {
    "num_nodes": node_features.shape[0],
    "num_edges": edge_index.shape[1],
    "predictions": results
  }


# ROUTES
@app.get("/health")
def health():
  return {
    "status": "healthy",
    "providers": model_session.get_providers()
  }


@app.get("/model_info")
def model_info():
  """
    Shows basic details about the models
  """
  return {
    "Model Name": "SimpleGCN",
    "Features": 1433,
    "Classes": 7,
    "Class Mapping": CORA_CLASSES,
    "Inputs": [
      {"name": inp.name, "shape": inp.shape, "type": inp.type} for inp in model_session.get_inputs()
    ],
    "Outputs": [
      {"name": out.name, "shape": out.shape, "type": out.type} for out in model_session.get_outputs()
    ]
  }


@app.post("/predict")
def predict_custom_graph(request: GraphPredictRequest):
  if not request.node_features:
    raise HTTPException(status_code=400, detail="Node Features cannot be empty")

  for feature_vector in request.node_features:
    if len(feature_vector) != 1433:
      raise HTTPException(status_code=422, detail="Each node's feature vector must exactly have 1433 features")

  node_features = np.array(request.node_features, dtype=np.float32)
  num_nodes = len(request.node_features)

  if request.edge_indices:
    edge_index = np.array(request.edge_indices, dtype=np.int64)
    if edge_index.ndim != 2 or edge_index.shape[0] != 2:
      raise HTTPException(422, "edge_indices must have shape [2, num_edges]")
    if edge_index.size and (edge_index.min() < 0 or edge_index.max() >= num_nodes):
      raise HTTPException(422, f"edge_indices must reference node indices between 0 and {num_nodes - 1}")
  else:
    node_ids = np.arange(num_nodes, dtype=np.int64)
    edge_index = np.vstack([node_ids, node_ids])

  all_node_indices = list(range(num_nodes))
  return run_model(node_features, edge_index, all_node_indices)


@app.post('/predict/cora_node')

def predict_real_cora_nodes(request: CORANodeRequest):
  from torch_geometric.datasets import Planetoid
  if not request.node_indices:
    raise HTTPException(status_code=400, detail="node_indices cannot be empty")

  try:
    cora_dataset = Planetoid(root=DATA_DIR, name="Cora")[0]
  except Exception as error:
    raise HTTPException(500, f"failed to load cora dataset: {error}")

  largest_valid_index = cora_dataset.num_nodes - 1
  invalid_index = [
    i for i in request.node_indices
    if i < 0 or i > largest_valid_index
  ]
  if invalid_index:
    raise HTTPException(400, f"node_index out of range (must be 0 to {largest_valid_index})")

  return run_model(
    cora_dataset.x.numpy(),
    cora_dataset.edge_index.numpy(),
    request.node_indices
  )