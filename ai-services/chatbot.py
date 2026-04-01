import random
import os

# ---------------------------------------------------------------------------
# Static response bank — realistic-looking AI tutor answers
# ---------------------------------------------------------------------------

RESPONSES = {
    "concept": [
        """Great question! Let me break this down for you.

**Core Concept**

This is one of the foundational ideas in the course. At its heart, it's about understanding *how* and *why* things work the way they do, rather than just memorising the steps.

**Key points to remember:**
- Start with the "why" before diving into the "how"
- Every concept builds on the previous one — don't skip ahead
- Practice with small examples first, then scale up

**A simple analogy:** Think of it like building a house — you need a solid foundation before you can add floors. The concepts in this course work exactly the same way.

Would you like me to walk through a specific example?""",

        """Absolutely, let me explain this clearly.

**What it is:**
This concept is central to the subject and appears in real-world applications constantly. Understanding it well will help you tackle more advanced topics with confidence.

**How it works:**
1. First, you identify the inputs and desired outputs
2. Then you apply the relevant rules or transformations
3. Finally, you validate the result against what you expect

**Common mistake to avoid:** Most learners try to skip step 2 and jump straight to 3 — that's where bugs and misunderstandings creep in.

Does that help clarify things?""",
    ],

    "summary": [
        """Here's a concise overview of what this course covers:

**Module 1 — Foundations**
We start from scratch, covering the core principles that everything else is built on. No prior experience needed.

**Module 2 — Core Techniques**
This is where the real learning happens. You'll work through hands-on exercises that reinforce theory with practice.

**Module 3 — Applied Projects**
By the end, you'll have built real-world examples you can show in your portfolio.

**What you'll walk away with:**
- A solid understanding of the fundamentals
- Practical skills you can apply immediately
- Confidence to explore more advanced topics on your own

Any specific module you'd like me to go deeper on?""",
    ],

    "prereq": [
        """Good news — this course is designed to be beginner-friendly!

**You should be comfortable with:**
- Basic computer usage (file management, browser, etc.)
- Logical thinking and problem-solving mindset
- Patience — some topics take a few passes to click

**Helpful but not required:**
- Any prior exposure to the subject area
- Experience with similar tools or technologies

**You do NOT need:**
- Years of experience
- A technical degree
- Any paid software (all tools used are free)

If you're unsure whether you're ready, just start Lesson 1 — the introduction will tell you everything you need to know within the first 10 minutes.""",
    ],

    "realworld": [
        """This is one of my favourite questions — the real-world applications are everywhere!

**Industry use cases:**
1. **Tech companies** use these exact principles in their day-to-day engineering work
2. **Startups** rely on them to move fast and build reliable products
3. **Freelancers** use them to deliver better results for clients

**Concrete example:**
Imagine you're working on a live project with a tight deadline. The techniques from this course let you solve problems methodically instead of guessing — saving hours of debugging and rework.

**Why it matters for your career:**
Employers specifically look for candidates who can *apply* knowledge, not just recite theory. This course bridges that gap.

What type of project are you hoping to apply this to?""",
    ],

    "default": [
        """That's a thoughtful question! Let me address it directly.

**Short answer:**
The course material covers this topic in detail, and the key insight is to focus on understanding the *pattern* rather than memorising specific steps.

**Longer explanation:**
When you encounter this type of problem, the approach is:
1. Identify what you're given and what you need
2. Look for the underlying pattern or rule
3. Apply it systematically and verify your result

**Pro tip:** The best way to solidify this is to pause the lesson, try it yourself, then compare your approach to the instructor's. Even if you get it wrong the first time, that attempt makes the correct method stick much better.

Feel free to ask a follow-up if any part is unclear!""",

        """Great question — let me give you a clear, structured answer.

**The key idea:**
This is something that trips up many learners, so you're not alone in asking. The most important thing to understand is the *relationship* between the components, not just what each one does in isolation.

**Think of it this way:**
- Each part of the course is like a piece of a puzzle
- This particular topic connects the earlier concepts to what comes next
- Once this clicks, the next few lessons will feel much more intuitive

**Practical exercise:**
After watching the lesson, try to explain this concept out loud to yourself in plain English (no jargon). If you can do that, you've understood it. If you stumble, that's exactly where to re-watch.

Anything specific you'd like me to elaborate on?""",

        """I'm glad you asked — this is actually a really important concept.

**Here's how I'd explain it:**

The course approaches this from first principles, which means instead of just showing you *what* to do, it explains *why* it works that way. That deeper understanding is what separates people who can only follow tutorials from people who can actually build things independently.

**Key takeaway:**
> The goal isn't just to finish the course — it's to internalise the thinking process so you can apply it to problems you've never seen before.

**Next steps I'd recommend:**
1. Re-watch this section with the goal of summarising it in 2-3 sentences
2. Try the practice exercise without looking at the solution first
3. Post in the community if you get stuck — other learners are super helpful

What else can I help with?""",
    ],
}

DUMMY_SOURCES = [
    {"chunk_text": "This concept is covered in Chapter 1, where we establish the foundational principles...", "lesson_id": None, "source_type": "course_content", "score": 0.91},
    {"chunk_text": "In the practical exercises, students apply these ideas to real-world scenarios...", "lesson_id": None, "source_type": "course_content", "score": 0.87},
    {"chunk_text": "The instructor demonstrates the technique step by step, highlighting common pitfalls...", "lesson_id": None, "source_type": "course_content", "score": 0.83},
]


def _pick_response(question: str, course_name: str) -> str:
    q = question.lower()

    if any(w in q for w in ["what is", "explain", "define", "what are", "how does", "tell me about", "describe"]):
        pool = RESPONSES["concept"]
    elif any(w in q for w in ["summary", "summarize", "overview", "cover", "topics", "what do", "what will"]):
        pool = RESPONSES["summary"]
    elif any(w in q for w in ["prerequisite", "before", "know before", "need to know", "required", "background"]):
        pool = RESPONSES["prereq"]
    elif any(w in q for w in ["real world", "real-world", "application", "use case", "industry", "job", "career", "project"]):
        pool = RESPONSES["realworld"]
    else:
        pool = RESPONSES["default"]

    response = random.choice(pool)
    # Personalise with course name where it fits
    response = response.replace("this course", f"**{course_name}**", 1)
    return response


async def chat(course_id: str, course_name: str, question: str) -> dict:
    response = _pick_response(question, course_name)
    sources = random.sample(DUMMY_SOURCES, k=random.randint(2, 3))
    return {"response": response, "sources": sources}
