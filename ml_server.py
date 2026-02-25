# QalqanAI ML Model Server
# Serves the suspicious_url_model.joblib via a REST API

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load model once at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'suspicious_url_model.joblib')
model = joblib.load(MODEL_PATH)
print(f"✓ ML model loaded: {type(model).__name__}")
print(f"  Classes: {list(model.classes_)}")

@app.route('/api/ml/predict', methods=['POST'])
def predict():
    """Classify a URL using the ML model.
    
    Input JSON:  { "url": "https://example.com" }
    Output JSON: { "url": "...", "prediction": "benign|phishing|malware|defacement",
                   "confidence": 0.95, "probabilities": { "benign": 0.95, ... } }
    """
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'Missing "url" field'}), 400

    url = data['url'].strip()
    if not url:
        return jsonify({'error': 'Empty URL'}), 400

    try:
        prediction = model.predict([url])[0]
        probabilities = model.predict_proba([url])[0]
        prob_dict = {cls: round(float(p), 4) for cls, p in zip(model.classes_, probabilities)}
        confidence = round(float(max(probabilities)), 4)

        return jsonify({
            'url': url,
            'prediction': prediction,
            'confidence': confidence,
            'probabilities': prob_dict,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ml/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'operational',
        'model_type': type(model).__name__,
        'classes': list(model.classes_),
    })


if __name__ == '__main__':
    print("""
╔══════════════════════════════════════════════╗
║       QalqanAI ML Model Server               ║
║──────────────────────────────────────────────║
║  Status:  OPERATIONAL                        ║
║  Port:    5001                               ║
║  API:     http://localhost:5001/api/ml        ║
╚══════════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=5001, debug=False)
