# TruthLens — Application Flow

## 1. Complete Product Flow

```text
                     LANDING PAGE
                           |
             +-------------+-------------+
             |                           |
        GET STARTED                   REVIEWER
             |                           |
             v                           v
        PUBLIC FEED                REVIEWER ACCESS
             |                           |
      +------+------+                 Code
      |      |      |                  |
   Filter  Sort  Submit               v
      |      |      |          REVIEWER DASHBOARD
      |      |      |                  |
      |      |      |             Review Claim
      |      |      |                  |
      |      |      |       +----------+----------+
      |      |      |       |          |          |
      |      |      |      TRUE       FALSE   MISLEADING
      |      |      |       |          |          |
      |      |      |       +----------+----------+
      |      |      |                  |
      +------+------+------------------+
             |
             v
        CLAIM DETAILS
```

## 2. Landing Flow

The visitor opens `/`.

The page explains:

- What TruthLens does.
- How risk triage works.
- Why human review matters.

Actions:

```text
Get Started → /feed
Reviewer → /reviewer/access
```

## 3. Public Feed Flow

Default state:

```text
Category = All
Status = All
Sort = Newest First
```

Feed loads claims.

Each card contains:

- Risk.
- Status.
- Claim text.
- Platform.
- Category.
- Submission time.
- View Details.

## 4. Submit Claim Flow

```text
Submit Claim
    ↓
Enter text
    ↓
Choose platform
    ↓
Choose category
    ↓
Optionally enter source URL
    ↓
Submit
    ↓
Frontend sends claim to API
    ↓
Backend validates
    ↓
Backend calculates risk
    ↓
Backend sets UNVERIFIED
    ↓
MongoDB stores claim
    ↓
Success response
```

## 5. Risk Analysis Flow

```text
text + sourceUrl
      |
      +--> sensational check
      |
      +--> uppercase percentage check
      |
      +--> source-link check
      |
      v
    flags
      |
flags.length >= 2?
   /          \
 YES           NO
  |             |
HIGH RISK    normal risk state
```

The exact rule implementation must match the hackathon brief.

## 6. Reviewer Flow

```text
Landing
  ↓
Reviewer
  ↓
Access Code
  ↓
POST reviewer/access
  ↓
Temporary reviewer session
  ↓
Reviewer Dashboard
  ↓
Pending / Unverified claim
  ↓
Review Claim
  ↓
Investigate evidence
  ↓
Choose verdict
  ↓
Write note
  ↓
Submit
  ↓
Backend updates claim
```

## 7. Detail Flow

```text
Feed
  ↓
View Details
  ↓
GET /claims/:id
  ↓
MongoDB
  ↓
Claim object
  ↓
Detail page
```

## 8. Filtering

Filtering determines **which claims** appear.

Examples:

```text
Category = Finance
Status = All
```

means all Finance claims.

```text
Category = All
Status = False
```

means all False claims.

```text
Category = All
Status = All
```

means all claims.

## 9. Sorting

Sorting determines **the order of the selected claims**.

Default:

```text
Newest First
```

Conceptually:

```text
submittedAt DESC
```

If additional sort options are implemented, they must be explicit and documented.

## 10. Error Flows

### Invalid claim

```text
Submit
 ↓
Validation fails
 ↓
Show field-level error
 ↓
User corrects input
```

### Reviewer access failure

```text
Wrong code
 ↓
Access denied
 ↓
Remain on access page
```

### Missing claim

```text
GET /claims/:id
 ↓
404
 ↓
Show "Claim not found"
```

### Review failure

```text
Submit Review
 ↓
API error
 ↓
Keep entered data
 ↓
Show actionable error
```

## 11. Empty States

Feed:

> No claims match your filters.

Reviewer queue:

> Review queue is clear.

Submission history is not required because public users do not have accounts.

## 12. Complete Example

```text
Visitor submits:
"BREAKING!!! RBI WILL CLOSE ALL BANK ACCOUNTS TOMORROW!!!"

Platform = WhatsApp
Category = Finance
Source = none

          ↓

Risk engine:
SENSATIONAL
SHOUTING
UNSOURCED

          ↓

HIGH RISK
UNVERIFIED

          ↓

Reviewer dashboard

          ↓

Reviewer checks evidence

          ↓

FALSE

Note:
"No official source supports the claim."

          ↓

Public feed

          ↓

User opens details and sees:
claim + flags + FALSE + note + timestamps
```
