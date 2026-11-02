# Security Specification for PosterHub Firestore Rules

## 1. Data Invariants
1. **Poster Collection (`/posters/{posterId}`)**:
   - Every poster document must have a valid identifier satisfying regex `^[a-zA-Z0-9_-]+$` with length <= 128.
   - `title`: String, length between 2 and 120 characters.
   - `category`: String, length between 2 and 50 characters.
   - `imageUrl`: String, valid image URI/URL, length <= 2048 characters.
   - `published`: Boolean flag.
   - `downloadCount`: Unsigned integer / number >= 0.
   - Visitors can ONLY read posters where `resource.data.published == true`.
   - Creating, modifying metadata, publishing/unpublishing, and deleting posters is strictly restricted to authenticated Administrators (either listed in `/admins/{uid}` or matching verified admin email `aqdamsahil@gmail.com`).
   - Public download counter increments: An unauthenticated or standard visitor may only increment `downloadCount` by 1 via a dedicated action, with no changes to any other field.

2. **Category Collection (`/categories/{categoryId}`)**:
   - Read is open to all visitors.
   - Write is restricted to authenticated Administrators.

3. **Admin Collection (`/admins/{adminId}`)**:
   - Read and write restricted strictly to confirmed Administrators.

---

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unpublished Poster Scrape**: Anonymous user attempts to read a poster where `published: false`. (Must be DENIED)
2. **Anonymous Poster Creation**: Unauthenticated user attempts to create a poster. (Must be DENIED)
3. **Admin Privilege Escalation**: Non-admin user attempts to create a document in `/admins/{theirUid}`. (Must be DENIED)
4. **Giant ID Attack**: Attempt to create a poster with a 2KB garbage document ID. (Must be DENIED by `isValidId`)
5. **Title Size Attack**: Attempt to create a poster with a 50,000-character title. (Must be DENIED by `title.size() <= 120`)
6. **Shadow Field Injection**: Attempt to create a poster with extra system fields like `isMasterAdmin: true`. (Must be DENIED by schema key validation)
7. **Negative Download Count**: Attempt to set `downloadCount` to a negative number or NaN. (Must be DENIED)
8. **Malicious Image URL Injection**: Image URL with 50KB payload. (Must be DENIED by size guard <= 2048)
9. **Fake Email Spoofing**: User signs in with unverified email `aqdamsahil@gmail.com` (`email_verified == false`). (Must be DENIED by `request.auth.token.email_verified == true`)
10. **Unauthorized Poster Deletion**: Non-admin or anonymous user attempts to delete a poster. (Must be DENIED)
11. **Malicious Title Overwrite during Download Increment**: User claims to increment download count but also modifies `title` or `imageUrl`. (Must be DENIED by `affectedKeys().hasOnly(['downloadCount'])`)
12. **Tampering with Category**: Non-admin attempts to delete or rename an established category. (Must be DENIED)
