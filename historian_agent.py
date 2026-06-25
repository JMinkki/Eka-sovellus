"""
Process Historian Data Analysis Agent
An AI-powered agent for analyzing industrial time-series data from process historians.
"""

import json
import math
import statistics
from datetime import datetime
from typing import Any

import anthropic

client = anthropic.Anthropic()

# --- Tool implementations ---

def load_historian_data(file_path: str, tag_filter: str | None = None) -> dict[str, Any]:
    """Load time-series data from a CSV file (timestamp,tag,value format)."""
    import csv
    from pathlib import Path

    path = Path(file_path)
    if not path.exists():
        return {"error": f"File not found: {file_path}"}
    if path.suffix.lower() != ".csv":
        return {"error": "Only CSV files are supported"}

    data: dict[str, list] = {}
    try:
        with open(path, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                tag = row.get("tag") or row.get("Tag") or row.get("TAG")
                ts = row.get("timestamp") or row.get("Timestamp") or row.get("TIMESTAMP")
                val = row.get("value") or row.get("Value") or row.get("VALUE")
                if not (tag and ts and val):
                    continue
                if tag_filter and tag_filter.lower() not in tag.lower():
                    continue
                try:
                    numeric_val = float(val)
                except ValueError:
                    continue
                if tag not in data:
                    data[tag] = []
                data[tag].append({"timestamp": ts, "value": numeric_val})
    except Exception as e:
        return {"error": str(e)}

    total = sum(len(v) for v in data.values())
    return {
        "tags": list(data.keys()),
        "tag_count": len(data),
        "total_records": total,
        "data": data,
    }


def calculate_statistics(data: dict[str, Any], tag: str) -> dict[str, Any]:
    """Compute descriptive statistics for a given tag."""
    tag_data = data.get("data", {}).get(tag)
    if not tag_data:
        return {"error": f"Tag '{tag}' not found in loaded data"}

    values = [r["value"] for r in tag_data]
    if not values:
        return {"error": "No values for tag"}

    sorted_vals = sorted(values)
    n = len(sorted_vals)
    mean = statistics.mean(values)
    std = statistics.stdev(values) if n > 1 else 0.0
    median = statistics.median(values)
    p25 = sorted_vals[int(0.25 * n)]
    p75 = sorted_vals[int(0.75 * n)]
    p95 = sorted_vals[int(0.95 * n)]

    return {
        "tag": tag,
        "count": n,
        "mean": round(mean, 4),
        "std": round(std, 4),
        "min": round(sorted_vals[0], 4),
        "max": round(sorted_vals[-1], 4),
        "median": round(median, 4),
        "p25": round(p25, 4),
        "p75": round(p75, 4),
        "p95": round(p95, 4),
    }


def detect_anomalies(data: dict[str, Any], tag: str, z_threshold: float = 3.0) -> dict[str, Any]:
    """Detect anomalies using z-score method."""
    tag_data = data.get("data", {}).get(tag)
    if not tag_data:
        return {"error": f"Tag '{tag}' not found"}

    values = [r["value"] for r in tag_data]
    if len(values) < 2:
        return {"error": "Need at least 2 data points"}

    mean = statistics.mean(values)
    std = statistics.stdev(values)
    if std == 0:
        return {"tag": tag, "anomalies": [], "message": "No variance — all values identical"}

    anomalies = []
    for record in tag_data:
        z = abs((record["value"] - mean) / std)
        if z > z_threshold:
            anomalies.append({
                "timestamp": record["timestamp"],
                "value": record["value"],
                "z_score": round(z, 3),
            })

    return {
        "tag": tag,
        "z_threshold": z_threshold,
        "total_points": len(values),
        "anomaly_count": len(anomalies),
        "anomaly_rate_pct": round(100 * len(anomalies) / len(values), 2),
        "anomalies": anomalies[:50],
    }


def analyze_trend(data: dict[str, Any], tag: str) -> dict[str, Any]:
    """Compute linear trend (slope, intercept, R²) for a tag's time series."""
    tag_data = data.get("data", {}).get(tag)
    if not tag_data:
        return {"error": f"Tag '{tag}' not found"}
    if len(tag_data) < 2:
        return {"error": "Need at least 2 data points for trend analysis"}

    # Use integer indices as x (avoids timestamp parsing complexity)
    n = len(tag_data)
    x = list(range(n))
    y = [r["value"] for r in tag_data]

    x_mean = statistics.mean(x)
    y_mean = statistics.mean(y)
    ss_xy = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, y))
    ss_xx = sum((xi - x_mean) ** 2 for xi in x)

    if ss_xx == 0:
        return {"error": "Cannot compute trend: all x values identical"}

    slope = ss_xy / ss_xx
    intercept = y_mean - slope * x_mean

    y_pred = [slope * xi + intercept for xi in x]
    ss_res = sum((yi - yp) ** 2 for yi, yp in zip(y, y_pred))
    ss_tot = sum((yi - y_mean) ** 2 for yi in y)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 1.0

    direction = "increasing" if slope > 0 else "decreasing" if slope < 0 else "flat"

    return {
        "tag": tag,
        "slope_per_sample": round(slope, 6),
        "intercept": round(intercept, 4),
        "r_squared": round(r_squared, 4),
        "direction": direction,
        "data_points": n,
        "first_timestamp": tag_data[0]["timestamp"],
        "last_timestamp": tag_data[-1]["timestamp"],
    }


def compare_tags(data: dict[str, Any], tag1: str, tag2: str) -> dict[str, Any]:
    """Compare two tags: Pearson correlation and basic stats delta."""
    d = data.get("data", {})
    if tag1 not in d:
        return {"error": f"Tag '{tag1}' not found"}
    if tag2 not in d:
        return {"error": f"Tag '{tag2}' not found"}

    # Use minimum shared length
    v1 = [r["value"] for r in d[tag1]]
    v2 = [r["value"] for r in d[tag2]]
    n = min(len(v1), len(v2))
    if n < 2:
        return {"error": "Need at least 2 aligned samples"}

    v1, v2 = v1[:n], v2[:n]
    m1, m2 = statistics.mean(v1), statistics.mean(v2)
    s1 = statistics.stdev(v1) if n > 1 else 0
    s2 = statistics.stdev(v2) if n > 1 else 0

    if s1 == 0 or s2 == 0:
        corr = None
        corr_note = "Cannot compute correlation: one tag has zero variance"
    else:
        cov = sum((a - m1) * (b - m2) for a, b in zip(v1, v2)) / (n - 1)
        corr = round(cov / (s1 * s2), 4)
        corr_note = None

    result = {
        "tag1": tag1,
        "tag2": tag2,
        "aligned_samples": n,
        "tag1_mean": round(m1, 4),
        "tag2_mean": round(m2, 4),
        "tag1_std": round(s1, 4),
        "tag2_std": round(s2, 4),
        "pearson_correlation": corr,
    }
    if corr_note:
        result["note"] = corr_note
    return result


# --- Tool schemas for the API ---

TOOLS = [
    {
        "name": "load_historian_data",
        "description": (
            "Load process historian time-series data from a CSV file. "
            "Expected columns: timestamp, tag, value. "
            "Returns available tags and a summary."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string", "description": "Path to the CSV historian export"},
                "tag_filter": {"type": "string", "description": "Optional substring to filter tags by name"},
            },
            "required": ["file_path"],
        },
    },
    {
        "name": "calculate_statistics",
        "description": "Calculate descriptive statistics (mean, std, min, max, percentiles) for a specific process tag.",
        "input_schema": {
            "type": "object",
            "properties": {
                "tag": {"type": "string", "description": "Tag name to analyze"},
            },
            "required": ["tag"],
        },
    },
    {
        "name": "detect_anomalies",
        "description": "Detect anomalous readings for a tag using the z-score method.",
        "input_schema": {
            "type": "object",
            "properties": {
                "tag": {"type": "string", "description": "Tag name to check for anomalies"},
                "z_threshold": {
                    "type": "number",
                    "description": "Z-score threshold (default 3.0; lower = more sensitive)",
                },
            },
            "required": ["tag"],
        },
    },
    {
        "name": "analyze_trend",
        "description": "Fit a linear trend to a tag's time series and report slope direction and R².",
        "input_schema": {
            "type": "object",
            "properties": {
                "tag": {"type": "string", "description": "Tag name to analyze for trend"},
            },
            "required": ["tag"],
        },
    },
    {
        "name": "compare_tags",
        "description": "Compare two process tags: compute Pearson correlation and mean/std differences.",
        "input_schema": {
            "type": "object",
            "properties": {
                "tag1": {"type": "string", "description": "First tag name"},
                "tag2": {"type": "string", "description": "Second tag name"},
            },
            "required": ["tag1", "tag2"],
        },
    },
]


def dispatch_tool(name: str, inputs: dict, loaded_data: dict) -> str:
    """Route a tool call to its implementation and return JSON string."""
    if name == "load_historian_data":
        result = load_historian_data(**inputs)
        # Store loaded data for subsequent calls (exclude raw data from response to save tokens)
        if "data" in result:
            loaded_data.update(result)
            summary = {k: v for k, v in result.items() if k != "data"}
            summary["status"] = "Data loaded successfully. Use other tools to analyze specific tags."
            return json.dumps(summary)
        return json.dumps(result)
    elif name == "calculate_statistics":
        return json.dumps(calculate_statistics(loaded_data, **inputs))
    elif name == "detect_anomalies":
        return json.dumps(detect_anomalies(loaded_data, **inputs))
    elif name == "analyze_trend":
        return json.dumps(analyze_trend(loaded_data, **inputs))
    elif name == "compare_tags":
        return json.dumps(compare_tags(loaded_data, **inputs))
    else:
        return json.dumps({"error": f"Unknown tool: {name}"})


# --- Agentic loop ---

def run_agent(user_query: str) -> None:
    """Run the historian analysis agent for the given user query."""
    print(f"\n{'='*60}")
    print(f"Query: {user_query}")
    print(f"{'='*60}\n")

    messages = [{"role": "user", "content": user_query}]
    loaded_data: dict = {}

    system = (
        "You are an expert process engineer and data analyst specializing in industrial "
        "process historian data. You help users understand their time-series data from "
        "SCADA/DCS historians by loading data, computing statistics, detecting anomalies, "
        "analyzing trends, and comparing process tags. "
        "Always start by loading the data if a file path is mentioned, then systematically "
        "analyze the requested aspects. Provide clear, actionable insights with engineering context."
    )

    while True:
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=8192,
            thinking={"type": "adaptive"},
            system=system,
            tools=TOOLS,
            messages=messages,
        )

        # Collect assistant message
        assistant_content = response.content
        messages.append({"role": "assistant", "content": assistant_content})

        # Print any text blocks
        for block in assistant_content:
            if block.type == "text":
                print(block.text)

        # Check stop reason
        if response.stop_reason == "end_turn":
            break

        if response.stop_reason != "tool_use":
            print(f"[Stopped: {response.stop_reason}]")
            break

        # Execute tool calls
        tool_results = []
        for block in assistant_content:
            if block.type == "tool_use":
                print(f"[Tool: {block.name}({json.dumps(block.input)})]")
                result_str = dispatch_tool(block.name, block.input, loaded_data)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result_str,
                })

        messages.append({"role": "user", "content": tool_results})


# --- Demo / entry point ---

def create_sample_data(path: str = "sample_historian.csv") -> None:
    """Generate a sample CSV historian file for demonstration."""
    import csv
    import random

    random.seed(42)
    base_time = datetime(2024, 1, 1, 0, 0, 0)
    rows = []
    for i in range(200):
        ts = base_time.replace(minute=i % 60, hour=i // 60)
        ts_str = ts.strftime("%Y-%m-%dT%H:%M:%S")
        # Reactor temperature: slow upward trend + noise + anomaly
        temp = 350 + 0.1 * i + random.gauss(0, 2)
        if i == 120:
            temp += 25  # spike anomaly
        rows.append({"timestamp": ts_str, "tag": "REACTOR_TEMP", "value": round(temp, 2)})
        # Pressure: correlated with temp
        pressure = 5.0 + 0.005 * (temp - 350) + random.gauss(0, 0.1)
        rows.append({"timestamp": ts_str, "tag": "REACTOR_PRESSURE", "value": round(pressure, 3)})
        # Flow rate: independent
        flow = 100 + random.gauss(0, 5)
        rows.append({"timestamp": ts_str, "tag": "FEED_FLOW", "value": round(flow, 2)})

    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "tag", "value"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Sample data written to {path}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        create_sample_data()
        run_agent(
            "Load the file sample_historian.csv and give me a full analysis: "
            "statistics for each tag, detect any anomalies, check trends, "
            "and tell me if reactor temperature and pressure are correlated."
        )
    elif len(sys.argv) > 1:
        # Pass a query directly as a command-line argument
        run_agent(" ".join(sys.argv[1:]))
    else:
        print("Usage:")
        print("  python historian_agent.py --demo")
        print("  python historian_agent.py 'Load data.csv and analyze REACTOR_TEMP'")
        print("\nInteractive mode:")
        query = input("Enter your analysis query: ").strip()
        if query:
            run_agent(query)
