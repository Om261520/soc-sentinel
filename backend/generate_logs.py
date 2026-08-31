import time
import random
import requests
from datetime import datetime

API_URL = "http://localhost:8000/api/logs"

SAMPLE_IPS = ["185.220.101.5", "45.142.214.165", "103.21.244.2", "192.168.1.105", "10.0.0.42"]
USERS = ["admin", "jsmith", "bwayne", "cclark", "analyst", "root"]

def generate_random_event():
    ip = random.choice(SAMPLE_IPS)
    user = random.choice(USERS)
    event_type = random.choice(["authentication", "firewall", "web", "endpoint"])

    if event_type == "authentication":
        status = random.choice(["failed", "failed", "success"])
        return {
            "event_type": "authentication",
            "source_ip": ip,
            "destination_ip": "10.0.0.10",
            "source_port": random.randint(30000, 60000),
            "destination_port": 22,
            "protocol": "SSH",
            "username": user,
            "hostname": "auth-srv-01",
            "action": "login",
            "status": status,
            "message": f"Authentication attempt for user {user} from {ip} [{status}]",
            "severity": "MEDIUM" if status == "failed" else "LOW"
        }
    elif event_type == "firewall":
        return {
            "event_type": "firewall",
            "source_ip": ip,
            "destination_ip": "10.0.0.50",
            "source_port": random.randint(30000, 60000),
            "destination_port": random.choice([80, 443, 3389, 8080]),
            "protocol": "TCP",
            "action": "block",
            "status": "blocked",
            "message": f"Firewall packet blocked from IP {ip}",
            "severity": "LOW"
        }
    elif event_type == "web":
        is_sqli = random.random() < 0.2
        msg = "' UNION SELECT * FROM users --" if is_sqli else "GET /index.html HTTP/1.1"
        return {
            "event_type": "web",
            "source_ip": ip,
            "destination_ip": "10.0.0.80",
            "source_port": random.randint(30000, 60000),
            "destination_port": 443,
            "protocol": "HTTPS",
            "username": user,
            "action": "HTTP POST",
            "status": "suspicious" if is_sqli else "success",
            "message": f"Web request from {ip}: {msg}",
            "severity": "HIGH" if is_sqli else "LOW"
        }
    else:
        is_ps = random.random() < 0.2
        msg = "powershell -EncodedCommand QXZhc3Q..." if is_ps else "process svchost.exe executed"
        return {
            "event_type": "endpoint",
            "source_ip": "10.0.0.105",
            "username": user,
            "hostname": "WKS-DEV-01",
            "action": "process_launch",
            "status": "suspicious" if is_ps else "success",
            "message": msg,
            "severity": "HIGH" if is_ps else "LOW"
        }

def run_generator(interval: float = 2.0):
    print(f"Starting SOC Sentinel Log Stream Generator -> Sending events to {API_URL} every {interval}s")
    while True:
        try:
            event = generate_random_event()
            resp = requests.post(API_URL, json=event, timeout=5)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Ingested {event['event_type']} log ({event['source_ip']}) -> Status {resp.status_code}")
        except Exception as e:
            print(f"Error streaming log: {e}")
        time.sleep(interval)

if __name__ == "__main__":
    run_generator()
