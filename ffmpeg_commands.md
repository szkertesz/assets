ffmpeg -i "/Volumes/.../.../01 track title.wav" -af aformat=s16:44100 "01 track title.flac"

for i in *.wav;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -i "$i" -af aformat=s16:44100 "${name}.flac"
done
