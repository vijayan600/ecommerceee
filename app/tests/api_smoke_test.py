import http.client
import json
import time
import os

HOST = '127.0.0.1'
PORT = 8000
BASE = f"{HOST}:{PORT}"

def request(method, path, token=None, body=None):
    conn = http.client.HTTPConnection(HOST, PORT, timeout=10)
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    body_bytes = None
    if body is not None:
        body_bytes = json.dumps(body).encode('utf-8')
    conn.request(method, path, body=body_bytes, headers=headers)
    resp = conn.getresponse()
    data = resp.read()
    text = data.decode('utf-8') if data else ''
    try:
        j = json.loads(text) if text else None
    except Exception:
        j = text
    return resp.status, j

print('Starting API smoke tests...')

# 1. GET /
status, body = request('GET', '/')
print('/ ->', status, body)

# 2. Admin login
admin_email = os.getenv('ADMIN_EMAIL', 'admin@suguna.com')
admin_password = os.getenv('ADMIN_PASSWORD', '123456')
status, body = request('POST', '/auth/login', body={'email': admin_email, 'password': admin_password})
print('/auth/login (admin) ->', status, body)
admin_token = None
if status == 200 and isinstance(body, dict):
    admin_token = body.get('token')

# 3. Register a new user (timestamped to avoid duplicates)
now = int(time.time())
user_email = f'test{now}@example.com'
user_password = 'password123'
status, body = request('POST', '/auth/register', body={'name': 'Test User', 'email': user_email, 'phone': '9999999999', 'password': user_password})
print('/auth/register ->', status, body)
user_token = None
if status in (200,201) and isinstance(body, dict):
    user_token = body.get('token')
else:
    # try login
    status, body = request('POST', '/auth/login', body={'email': user_email, 'password': user_password})
    print('/auth/login (new user) ->', status, body)
    if status == 200 and isinstance(body, dict):
        user_token = body.get('token')

# 4. Create a product as admin
product_id = None
if admin_token:
    product = {'name': 'Smoke Test Product', 'image': 'http://example.com/img.png', 'price': 99.9, 'stock': 10, 'note': 'smoke'}
    status, body = request('POST', '/products/', token=admin_token, body=product)
    print('/products POST ->', status, body)
    if status in (200,201) and isinstance(body, dict):
        product_id = body.get('id')

# 5. List products
status, body = request('GET', '/products')
print('/products GET ->', status, body)

# 6. Create an order as user
order_id = None
if user_token and product_id:
    order_body = {
        'items': [{'product_id': product_id, 'quantity': 1}],
        'delivery_address': {'full_name': 'Test User', 'phone': '9999999999', 'street': '123 Test St', 'city': 'City', 'pincode': '000000'},
        'payment_id': 'test_pay_1'
    }
    status, body = request('POST', '/orders', token=user_token, body=order_body)
    print('/orders POST ->', status, body)
    if status in (200,201) and isinstance(body, dict):
        order_id = body.get('id')

# 7. Get my orders
if user_token:
    status, body = request('GET', '/orders/my-orders', token=user_token)
    print('/orders/my-orders ->', status, body)

# 8. Get order detail as user
if user_token and order_id:
    status, body = request('GET', f'/orders/{order_id}', token=user_token)
    print(f'/orders/{order_id} ->', status, body)

# 9. Admin: list orders
if admin_token:
    status, body = request('GET', '/admin/orders', token=admin_token)
    print('/admin/orders ->', status, body)

# 10. Admin: update order status
if admin_token and order_id:
    status, body = request('PATCH', f'/admin/orders/{order_id}/status', token=admin_token, body={'status':'confirmed'})
    print(f'PATCH /admin/orders/{order_id}/status ->', status, body)

print('Smoke tests complete.')
