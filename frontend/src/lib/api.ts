export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface HealthResponse {
  status: string;
  providers: string[];
}

export interface PredictionResult {
  node_index: number;
  predicted_class_id: number;
  predicted_class_label: string;
  probabilities: number[];
  logits: number[];
}

export interface PredictResponse {
  num_nodes: number;
  num_edges: number;
  predictions: PredictionResult[];
}

export interface GraphPredictRequest {
  node_features: number[][];
  edge_indices?: number[][];
}

export interface CoraNodeRequest {
  node_indices: number[];
}

/**
 * Thrown for any non-2xx response. `detail` mirrors FastAPI's
 * `{ "detail": "..." }` error body shape when present.
 */
export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Could not reach the prediction service. Check your connection or the API URL.");
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // response body wasn't JSON — keep the generic message
    }
    throw new ApiError(response.status, detail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  predictCustomGraph: (body: GraphPredictRequest) =>
    request<PredictResponse>("/predict", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  predictCoraNodes: (body: CoraNodeRequest) =>
    request<PredictResponse>("/predict/cora_node", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
