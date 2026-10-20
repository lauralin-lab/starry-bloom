# Starry Bloom

An interactive painting with musical stars, local audio uploads and piano/string interactions. Static HTML, Canvas and Web Audio; no backend or build step.

## Run locally
`python3 -m http.server 8080`

Open http://localhost:8080. Select music, press play, hover stars for harmony, click for piano, drag to seek. Upload MP3/WAV/M4A/OGG audio; processing runs locally in a worker and estimates pitches and onsets, not a verified score.

## Deploy
GitHub Pages: deploy from `main`, repository root. All URLs are relative so project-site paths work.

See CREDITS.md for music attribution and licenses. The source MIDI-derived recordings remain CC BY-SA 2.5.
