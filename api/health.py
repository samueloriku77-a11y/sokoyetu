def handler(request):
    # Simple fallback serverless function for health checks
    return {
        "statusCode": 200,
        "body": '{"status": "ok", "service": "sokoyetu"}',
        "headers": {"Content-Type": "application/json"},
    }
