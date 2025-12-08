# Invoice Management Testing Guide

## Overview
Complete invoice management system with create, approve, and payment tracking functionality.

## API Endpoints

### Base URL
```
https://construct.velandev.in/api/auth/
```

### Endpoints
- **GET** `/invoices/` - Get all invoices
- **POST** `/invoices/` - Create new invoice
- **PATCH** `/invoices/{id}/` - Update invoice (approve/mark paid)

## Testing Steps

### 1. Access Invoice Management
1. Login as Admin (username: `john_doe`, password: `secure123`)
2. Open Admin Dashboard
3. Click menu icon (☰) on top left
4. Select "Invoice Management" from the side menu
5. You should see the Invoice Management screen

### 2. View Existing Invoices
- The screen will automatically load all invoices from the backend
- Each invoice card shows:
  - Invoice number
  - Status badge (PENDING/APPROVED/PAID)
  - Vendor name
  - Project name
  - Description
  - Subtotal, Tax, and Total amounts
  - Invoice date and due date
  - Action buttons

### 3. Create Steel Invoice
1. Click "+ Create Invoice" button
2. Fill in the form:
   ```
   Invoice Number: INV2024001
   Vendor: Select from list (e.g., ABC Construction Materials)
   Project: Select from list (e.g., Residential Complex A)
   Purchase Order: Select from list (optional)
   Description: Steel beams delivery as per PO2024001
   Subtotal: 25000
   Tax Amount: 2500
   Total Amount: 27500
   Invoice Date: 2024-03-20
   Due Date: 2024-04-20
   ```
3. Click "Create Invoice"
4. Check console for API response
5. Invoice should appear in the list with status "PENDING"

### 4. Create Concrete Invoice
1. Click "+ Create Invoice" button
2. Fill in the form:
   ```
   Invoice Number: INV2024002
   Vendor: Select different vendor
   Project: Select from list
   Purchase Order: Select from list (optional)
   Description: Concrete mix delivery as per PO2024002
   Subtotal: 15000
   Tax Amount: 1500
   Total Amount: 16500
   Invoice Date: 2024-03-18
   Due Date: 2024-04-18
   ```
3. Click "Create Invoice"
4. Invoice should appear in the list

### 5. Approve Invoice
1. Find an invoice with status "PENDING"
2. Click "Approve" button
3. Check console for API response
4. Invoice status should change to "APPROVED"
5. "Approve" button should disappear
6. "Mark Paid" button should appear

### 6. Mark Invoice as Paid
1. Find an invoice with status "APPROVED"
2. Click "Mark Paid" button
3. Check console for API response
4. Invoice status should change to "PAID"
5. All action buttons should disappear (except View Details)

### 7. View Invoice Details
1. Click "View Details" on any invoice
2. Modal should open showing:
   - Complete invoice information
   - All amounts
   - Dates
   - Status
   - Paid date (if applicable)

## Database Verification

### Check in Backend Database

1. **View all invoices:**
   ```sql
   SELECT * FROM invoices ORDER BY created_at DESC;
   ```

2. **Check specific invoice:**
   ```sql
   SELECT * FROM invoices WHERE invoice_number = 'INV2024001';
   ```

3. **Verify status changes:**
   ```sql
   SELECT invoice_number, status, approved_by, paid_date 
   FROM invoices 
   WHERE invoice_number IN ('INV2024001', 'INV2024002');
   ```

4. **Check relationships:**
   ```sql
   SELECT i.invoice_number, v.name as vendor_name, p.name as project_name, i.total_amount, i.status
   FROM invoices i
   LEFT JOIN vendors v ON i.vendor_id = v.id
   LEFT JOIN projects p ON i.project_id = p.id
   ORDER BY i.created_at DESC;
   ```

## Console Logs to Check

### Creating Invoice
```
Creating invoice: {invoice_number: "INV2024001", vendor: 1, ...}
Invoice created: {id: 1, invoice_number: "INV2024001", status: "pending", ...}
```

### Approving Invoice
```
Approving invoice: 1 {status: "approved", approved_by: 1}
```

### Marking as Paid
```
Marking invoice as paid: 1 {status: "paid", paid_date: "2024-04-15"}
```

## Expected API Responses

### POST /invoices/ (Create)
```json
{
  "id": 1,
  "invoice_number": "INV2024001",
  "vendor": 1,
  "purchase_order": 1,
  "project": 1,
  "description": "Steel beams delivery as per PO2024001",
  "subtotal": "25000.00",
  "tax_amount": "2500.00",
  "total_amount": "27500.00",
  "invoice_date": "2024-03-20",
  "due_date": "2024-04-20",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### PATCH /invoices/{id}/ (Approve)
```json
{
  "id": 1,
  "status": "approved",
  "approved_by": 1,
  "approved_date": "2024-01-15"
}
```

### PATCH /invoices/{id}/ (Mark Paid)
```json
{
  "id": 1,
  "status": "paid",
  "paid_date": "2024-04-15"
}
```

## Troubleshooting

### Issue: "Failed to load invoices"
- **Check:** Token is valid (logout and login again)
- **Check:** API endpoint is correct
- **Check:** Network connection

### Issue: "Failed to create invoice"
- **Check:** All required fields are filled
- **Check:** Vendor, Project IDs exist in database
- **Check:** Invoice number is unique
- **Check:** Amounts are valid numbers
- **Check:** Dates are in YYYY-MM-DD format

### Issue: "Failed to approve/mark paid"
- **Check:** Invoice exists
- **Check:** Invoice is in correct status (pending → approved → paid)
- **Check:** User has permission

## Features Implemented

✅ GET all invoices from backend
✅ Display invoices with status badges
✅ Create new invoice with form validation
✅ Select vendor, project, and purchase order from dropdowns
✅ Approve pending invoices
✅ Mark approved invoices as paid
✅ View detailed invoice information
✅ Pull-to-refresh functionality
✅ Real-time status updates
✅ Console logging for debugging
✅ Error handling with user-friendly messages

## Status Flow

```
PENDING → APPROVED → PAID
   ↓         ↓
Approve   Mark Paid
Button    Button
```

## Notes

- Invoice numbers must be unique
- Dates must be in YYYY-MM-DD format
- Amounts are stored as decimals with 2 decimal places
- Status changes are irreversible (pending → approved → paid)
- Only pending invoices can be approved
- Only approved invoices can be marked as paid
- All API calls are logged to console for debugging
