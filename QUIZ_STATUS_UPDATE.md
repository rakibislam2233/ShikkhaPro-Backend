# Quiz Status Update Documentation

## Overview
The quiz status system has been updated from the previous `draft`, `published`, `archived` system to a simplified `active` and `deleted` system as requested.

## Status Changes

### Previous Status Values
- `draft` - Quiz was in draft state
- `published` - Quiz was published and available
- `archived` - Quiz was archived/soft deleted

### New Status Values
- `active` - Quiz is active and available (replaces both `draft` and `published`)
- `deleted` - Quiz is soft deleted (replaces `archived`)

## Files Updated

### 1. Interface Updates
**File:** `src/models/quiz/quiz.interface.ts`
- Updated `IQuiz.status` type from `'draft' | 'published' | 'archived'` to `'active' | 'deleted'`
- Updated `IUpdateQuizRequest.status` type from `'draft' | 'published' | 'archived'` to `'active' | 'deleted'`

### 2. Model Updates
**File:** `src/models/quiz/quiz.model.ts`
- Updated status enum from `['draft', 'published', 'archived']` to `['active', 'deleted']`
- Changed default status from `'published'` to `'active'`
- Updated `getPublicQuizzes()` method to filter by `status: 'active'` instead of `status: 'published'`

### 3. Service Updates
**File:** `src/models/quiz/quiz.service.ts`
- Updated queries to exclude `'deleted'` instead of `'archived'` status
- Updated soft delete logic to set status to `'deleted'` instead of `'archived'`
- All status filtering now uses `{ $ne: 'deleted' }` pattern

### 4. Validation Updates
**File:** `src/models/quiz/quiz.validation.ts`
- Updated Zod validation schema for status field to accept only `['active', 'deleted']`

### 5. Documentation Updates
**File:** `src/docs/swagger.ts`
- Updated Swagger API documentation to reflect new status values
- Changed default status in documentation from `'published'` to `'active'`
- Updated example messages to use "activated" instead of "published"

## API Impact

### Status Filtering
All quiz queries now use the new status system:

**Active Quizzes:**
```javascript
// Get all active quizzes (not deleted)
{ status: { $ne: 'deleted' } }

// Get only active quizzes
{ status: 'active' }
```

**Deleted Quizzes:**
```javascript
// Get only deleted quizzes
{ status: 'deleted' }
```

### Default Behavior
- New quizzes are created with `status: 'active'` by default
- Public quiz listings only show `status: 'active'` quizzes
- User quiz listings exclude `status: 'deleted'` quizzes
- Quiz deletion sets `status: 'deleted'` (soft delete)

## Database Migration

### For Existing Data
If you have existing quizzes in your database, you may need to run a migration to update the status values:

```javascript
// MongoDB migration script
db.quizzes.updateMany(
  { status: { $in: ['draft', 'published'] } },
  { $set: { status: 'active' } }
);

db.quizzes.updateMany(
  { status: 'archived' },
  { $set: { status: 'deleted' } }
);
```

### SQL Equivalent (if using SQL database)
```sql
UPDATE quizzes SET status = 'active' WHERE status IN ('draft', 'published');
UPDATE quizzes SET status = 'deleted' WHERE status = 'archived';
```

## API Examples

### Create Quiz (Default Active Status)
```bash
curl -X POST http://localhost:7972/api/quizzes/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "academicLevel": "ssc",
    "subject": "Mathematics",
    "topic": "Algebra",
    "language": "english",
    "questionType": "mcq",
    "difficulty": "medium",
    "questionCount": 5
  }'
```
*Quiz will be created with `status: 'active'` by default*

### Update Quiz Status
```bash
curl -X PATCH http://localhost:7972/api/quizzes/{quizId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### Soft Delete Quiz
```bash
curl -X DELETE http://localhost:7972/api/quizzes/{quizId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
*This sets `status: 'deleted'` instead of physically removing the quiz*

### Get Active Quizzes Only
```bash
curl -X GET "http://localhost:7972/api/quizzes/my-quizzes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
*Returns only quizzes where `status !== 'deleted'`*

## Benefits of New Status System

1. **Simplified Logic**: Only two states to manage instead of three
2. **Clearer Semantics**: `active` vs `deleted` is more intuitive than `draft/published/archived`
3. **Better UX**: No confusion between draft and published states
4. **Easier Filtering**: Simple active/deleted binary state
5. **Consistent Behavior**: All active quizzes behave the same regardless of previous draft/published distinction

## Backward Compatibility

**⚠️ Breaking Change Notice:**
This is a breaking change for any existing API clients that rely on the old status values. Please update your frontend applications to use the new status values:

- Replace any references to `'draft'` or `'published'` with `'active'`
- Replace any references to `'archived'` with `'deleted'`
- Update status filtering logic accordingly

## Testing

The changes have been verified to:
- ✅ Compile successfully with TypeScript
- ✅ Pass all type checking
- ✅ Maintain API compatibility (with new status values)
- ✅ Preserve soft delete functionality
- ✅ Update all related documentation

All quiz-related functionality now uses the new simplified `active`/`deleted` status system.