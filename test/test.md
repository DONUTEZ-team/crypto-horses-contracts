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

## Game

1. `launch_race`:

   - ✅ should fail if not admin is trying to launch race;
   - ✅ should fail if registration start time is too low;
   - ✅ should fail if betting start time is too low;
   - ✅ should fail if race start time is too low;
   - ❌ should launch race - 1;
   - ❌ should launch race - 2.

2. `register_horse`:

   - ❌

3. `bet`:

   - ❌

4. `set_admin`:

   - ✅ should fail if not admin is trying to setup new pending admin;
   - ✅ should setup new pending admin by admin.

5. `confirm_admin`:

   - ✅ should fail if not pending admin is trying to confirm new admin;
   - ✅ should confirm new admin by pending admin.

6. `set_min_register_time`:

   - ✅ should fail if not admin is trying to set min registration time;
   - ✅ should set new min registration time by admin.

7. `set_min_betting_time`:

   - ✅ should fail if not admin is trying to set min betting time;
   - ✅ should set new min betting time by admin.
