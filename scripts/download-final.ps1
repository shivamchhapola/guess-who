$images = @(
  @{ dest = "public\templates\hollywood\zendaya.jpg";         url = "https://image.tmdb.org/t/p/w500/6TE2AlOUqcrs7CyJiWYgodmee1r.jpg" }
  @{ dest = "public\templates\marvel\spider-man.jpg";          url = "https://image.tmdb.org/t/p/w500/5OK84Wn1bIEIThFKcVoaN087mLj.jpg" }
  @{ dest = "public\templates\marvel\nick-fury.jpg";           url = "https://image.tmdb.org/t/p/w500/AiAYAqwpM5xmiFrAIeQvUXDCVvo.jpg" }
  @{ dest = "public\templates\marvel\scarlet-witch.jpg";       url = "https://image.tmdb.org/t/p/w500/wIU675y4dofIDVuhaNWPizJNtep.jpg" }
  @{ dest = "public\templates\marvel\hawkeye.jpg";             url = "https://image.tmdb.org/t/p/w500/yB84D1neTYXfWBaV0QOE9RF2VCu.jpg" }
  @{ dest = "public\templates\marvel\black-panther.jpg";       url = "https://image.tmdb.org/t/p/w500/nL16SKfyP1b7Hk6LsuWiqMfbdb8.jpg" }
)
$headers = @{'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
$ok = 0; $fail = 0
foreach ($img in $images) {
  Write-Host "Downloading $($img.dest)..." -NoNewline
  try {
    Invoke-WebRequest -Uri $img.url -OutFile $img.dest -UseBasicParsing -TimeoutSec 15 -Headers $headers
    $size = (Get-Item $img.dest).Length
    if ($size -lt 5000) { Write-Host " SMALL($size)" ; $fail++ }
    else { Write-Host " OK($size bytes)" ; $ok++ }
  } catch { Write-Host " FAILED: $_" ; $fail++ }
}
Write-Host "Done. OK=$ok FAILED=$fail"
