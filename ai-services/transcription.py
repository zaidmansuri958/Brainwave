from faster_whisper import WhisperModel
import os
import tempfile
import subprocess

_model = None


def get_model():
    global _model
    if _model is None:
        model_size = os.getenv("WHISPER_MODEL", "base")
        print(f"Loading Whisper model: {model_size}")
        # device="cpu", compute_type="int8" for smaller/faster on CPU
        _model = WhisperModel(model_size, device="cpu", compute_type="int8")
    return _model


def extract_audio(video_path: str) -> str:
    """Extract audio track from video file using ffmpeg."""
    audio_path = video_path.replace(".mp4", ".mp3").replace(".webm", ".mp3")
    if not audio_path.endswith(".mp3"):
        audio_path = video_path + ".mp3"

    result = subprocess.run(
        ["ffmpeg", "-i", video_path, "-vn", "-acodec", "mp3", "-y", audio_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise Exception(f"FFmpeg audio extraction failed: {result.stderr}")
    return audio_path


def transcribe_file(file_path: str) -> dict:
    """
    Transcribe audio or video file.
    Returns: { "text": str, "segments": [{start, end, text}], "language": str }
    """
    model = get_model()

    # If video, extract audio first
    ext = os.path.splitext(file_path)[1].lower()
    if ext in [".mp4", ".avi", ".webm", ".mkv", ".mov"]:
        audio_path = extract_audio(file_path)
        try:
            segments_iter, info = model.transcribe(audio_path, language=None, task="transcribe")
            segments_list = list(segments_iter)
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)
    else:
        segments_iter, info = model.transcribe(file_path, language=None, task="transcribe")
        segments_list = list(segments_iter)

    full_text = " ".join(s.text for s in segments_list).strip()
    return {
        "text": full_text,
        "segments": [
            {"start": s.start, "end": s.end, "text": s.text}
            for s in segments_list
        ],
        "language": info.language or "en"
    }


def transcribe_from_url(file_url: str, material_id: str) -> dict:
    """Download file from URL and transcribe."""
    import httpx

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        with httpx.stream("GET", file_url) as response:
            with open(tmp_path, "wb") as f:
                for chunk in response.iter_bytes():
                    f.write(chunk)

        return transcribe_file(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
