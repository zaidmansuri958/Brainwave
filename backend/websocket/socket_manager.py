import socketio
from app.utils.jwt import verify_token

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# Map user_id → sid
connected_users: dict = {}
# Map course_id → set of sids
course_rooms: dict = {}


@sio.event
async def connect(sid, environ, auth):
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get("token")

    if token:
        try:
            payload = verify_token(token)
            user_id = payload.get("sub")
            connected_users[user_id] = sid
            await sio.save_session(sid, {"user_id": user_id, "role": payload.get("role")})
            print(f"User {user_id} connected as {sid}")
        except Exception:
            await sio.disconnect(sid)
    else:
        await sio.disconnect(sid)


@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get("user_id") if session else None
    if user_id and connected_users.get(user_id) == sid:
        del connected_users[user_id]

    # Remove from all rooms
    for course_id, sids in course_rooms.items():
        sids.discard(sid)


@sio.event
async def join_course_room(sid, data):
    course_id = data.get("course_id")
    if course_id:
        room = f"course_{course_id}"
        await sio.enter_room(sid, room)
        if course_id not in course_rooms:
            course_rooms[course_id] = set()
        course_rooms[course_id].add(sid)


@sio.event
async def leave_course_room(sid, data):
    course_id = data.get("course_id")
    if course_id:
        room = f"course_{course_id}"
        await sio.leave_room(sid, room)
        if course_id in course_rooms:
            course_rooms[course_id].discard(sid)


async def emit_notification(user_id: str, notification: dict):
    """Send notification to a specific user."""
    sid = connected_users.get(user_id)
    if sid:
        await sio.emit("notification", notification, to=sid)


async def emit_to_course_room(course_id: str, event: str, data: dict):
    """Broadcast to all users in a course room."""
    await sio.emit(event, data, room=f"course_{course_id}")


async def emit_live_session_starting(course_id: str, session_data: dict):
    await emit_to_course_room(course_id, "live_session_starting", session_data)


async def emit_new_community_post(course_id: str, post: dict):
    await emit_to_course_room(course_id, "new_community_post", {"post": post})


async def emit_student_at_risk(teacher_id: str, data: dict):
    await emit_notification(teacher_id, {"type": "student_at_risk", **data})
