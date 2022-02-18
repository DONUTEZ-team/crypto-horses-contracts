# Test coverage for contracts

## UbineticProxy

1. `set_admin`:

   - ✅ should fail if not admin is trying to setup new pending admin;
   - ✅ should setup new pending admin by admin.

2. `confirm_admin`:

   - ✅ should fail if not pending admin is trying to confirm new admin;
   - ✅ should confirm new admin by pending admin.

3. `change_ubinetic`:

   - ✅ should fail if not admin is trying to change ubinetic contract address;
   - ✅ should change ubinetic contract address by admin.

4. `get_current_epoch` [VIEW]:

   - ✅ should fail if ubinetic `get_current_epoch` view not found;
   - ✅ should return proper current epoch.

5. `get_entropy` [VIEW]:

   - ✅ should fail if ubinetic `get_entropy` view not found;
   - ✅ should return proper entropy for epoch.
