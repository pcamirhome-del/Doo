# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Path & Ownership Binding**: Every document in `/users/{userId}/wishlist/{itemId}` belongs exclusively to `userId`. Only an authenticated user with `request.auth.uid == userId` and `request.auth.token.email_verified == true` may read, list, create, update, or delete items in their wishlist subcollection.
2. **ID & Payload Integrity**: Both `{userId}` and `{itemId}` path variables must satisfy `isValidId()` (`^[a-zA-Z0-9_\-]+$`, length 1..128), and `incoming().id == itemId` as well as `incoming().userId == userId` and `incoming().userId == request.auth.uid`.
3. **Strict Key & Size Enforcement**: All string properties have explicit maximum lengths matching `firebase-blueprint.json` (`name <= 200`, `developer <= 200`, `thumbnail <= 2048`, `officialUrl <= 2048`, `directDownloadUrl <= 2048`). Unlisted shadow fields are strictly rejected via `hasOnly()`.
4. **Temporal & Immutable Fields**: `createdAt` must equal `request.time` on creation and remain immutable on update. `updatedAt` must equal `request.time` on creation and update. `userId`, `id`, and `appId` are immutable on update.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth == null` attempting to create `/users/u1/wishlist/item1`.
2. **Unverified Email Write**: `auth.uid == 'u1'` with `email_verified == false` attempting to create `/users/u1/wishlist/item1`.
3. **Cross-User Read/List**: `auth.uid == 'u2'` attempting `get` or `list` on `/users/u1/wishlist`.
4. **Cross-User Spoofed Payload**: `auth.uid == 'u1'` writing to `/users/u1/wishlist/item1` with `userId: 'u2'`.
5. **Shadow / Ghost Field Injection**: Payload containing `isAdmin: true` or `unlistedField: 'hack'`.
6. **ID Poisoning Attack**: Document ID containing special characters (`item$1/../../admin`) or > 128 chars.
7. **Oversized String Exhaustion**: `name` or `officialUrl` containing a 10,000-character string.
8. **Invalid Platform Enum**: `platform: 'playstation'` instead of `['pc', 'android', 'ios']`.
9. **Client Timestamp Forgery**: `createdAt` or `updatedAt` set to a past/future timestamp instead of `request.time`.
10. **Immutable Field Mutation**: Updating `createdAt`, `userId`, or `id` on an existing wishlist item.
11. **Value Poisoning on Update**: Updating `name` to a number `12345` or empty string `""`.
12. **Disallowed Update Key**: Attempting to mutate `appId` during an update action.
