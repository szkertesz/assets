
## Exact Audio Copy
- [How to setup Exact Audio Copy for FLAC ripping](https://captainrookie.com/how-to-setup-exact-audio-copy-for-flac-ripping/)
- [How to rip a CD to FLAC using Exact Audio Copy
](https://captainrookie.com/how-to-rip-a-cd-to-lossless-flac-using-exact-audio-copy/)


## `ffmpeg`
- convert .wav audio to .flac
  [Convert WAV to FLAC in FFmpeg](https://superuser.com/questions/1145138/convert-wav-to-flac-in-ffmpeg)
  `ffmpeg -i "/Volumes/.../.../01 track title.wav" -af aformat=s16:44100 "01 track title.flac"`

- batch convert .wav audio to .flac

  ```
  for i in *.wav;
    do name=`echo "$i" | cut -d'.' -f1`
    echo "$name"
    ffmpeg -i "$i" -af aformat=s16:44100 "${name}.flac"
  done
  ```
