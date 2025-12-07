from typing import List, Dict, Any

CHANNELS = {
    "general": [
        {"user": "Alice", "text": "Welcome to the team, Bob!", "ts": "1678886400"},
        {"user": "Bob", "text": "Thanks Alice, happy to be here.", "ts": "1678886460"},
    ],
    "engineering": [
        {"user": "Dave", "text": "Deploying to prod in 5 mins.", "ts": "1678890000"},
        {"user": "Eve", "text": "Standing by.", "ts": "1678890060"},
    ]
}

def send_mock_message(channel: str, text: str) -> Dict[str, Any]:
    return {
        "channel": channel,
        "text": text,
        "status": "sent",
        "ts": "1678900000"
    }

def get_mock_channel_history(channel: str) -> List[Dict[str, Any]]:
    return CHANNELS.get(channel, [])
