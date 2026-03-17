import os
import numpy as np

# Try to load trained model, fall back to rule-based
_model = None


def load_model():
    global _model
    model_path = "models/dropout_predictor.pkl"
    if os.path.exists(model_path):
        try:
            import joblib
            _model = joblib.load(model_path)
            print("Loaded trained dropout prediction model")
        except Exception as e:
            print(f"Model load failed: {e}")


def predict_risk(features: dict) -> dict:
    """
    Predict dropout risk for a student.
    Features:
        avg_watch_percent, rewatch_rate, quiz_avg_score,
        days_since_last_active, completion_rate, community_posts_count,
        assignment_submit_rate, enrollment_days
    """
    if _model is not None:
        try:
            X = np.array([[
                features.get("avg_watch_percent", 0),
                features.get("rewatch_rate", 0),
                features.get("quiz_avg_score", 0),
                features.get("days_since_last_active", 0),
                features.get("completion_rate", 0),
                features.get("community_posts_count", 0),
                features.get("assignment_submit_rate", 0),
                features.get("enrollment_days", 0),
            ]])
            proba = _model.predict_proba(X)[0][1]
        except Exception:
            proba = _rule_based_score(features)
    else:
        proba = _rule_based_score(features)

    if proba < 0.3:
        risk_level = "low"
    elif proba < 0.65:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {"risk_score": float(round(proba, 4)), "risk_level": risk_level}


def _rule_based_score(features: dict) -> float:
    """Simple rule-based risk scoring."""
    score = 0.0

    days_inactive = features.get("days_since_last_active", 0)
    if days_inactive > 14:
        score += 0.4
    elif days_inactive > 7:
        score += 0.2

    completion = features.get("completion_rate", 0)
    if completion < 0.2:
        score += 0.3
    elif completion < 0.5:
        score += 0.1

    quiz_score = features.get("quiz_avg_score", 0)
    if quiz_score < 0.3:
        score += 0.2

    watch = features.get("avg_watch_percent", 0)
    if watch < 0.3:
        score += 0.1

    return min(score, 1.0)


def train_model(training_data: list):
    """
    Train the dropout prediction model.
    training_data: list of (features_dict, label) where label=1 means dropped out.
    """
    from sklearn.ensemble import RandomForestClassifier
    import joblib

    if len(training_data) < 50:
        print("Not enough training data (need at least 50 samples)")
        return

    X = []
    y = []
    for features, label in training_data:
        X.append([
            features.get("avg_watch_percent", 0),
            features.get("rewatch_rate", 0),
            features.get("quiz_avg_score", 0),
            features.get("days_since_last_active", 0),
            features.get("completion_rate", 0),
            features.get("community_posts_count", 0),
            features.get("assignment_submit_rate", 0),
            features.get("enrollment_days", 0),
        ])
        y.append(label)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/dropout_predictor.pkl")
    global _model
    _model = model
    print("Model trained and saved")


# Load model on startup
load_model()
