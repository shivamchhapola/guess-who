$images = @(
  @{ dest = "public\templates\office\oscar-martinez.jpg";  url = "https://image.tmdb.org/t/p/w500/2QvXxkq9N9T0nZdEQ7VrKhwT0H7.jpg" }
  @{ dest = "public\templates\office\stanley-hudson.jpg";  url = "https://image.tmdb.org/t/p/w500/6IKMm6BTRG3YYeQhBhRG13I7N27.jpg" }
  @{ dest = "public\templates\office\phyllis-vance.jpg";   url = "https://image.tmdb.org/t/p/w500/rLFQb1JZSUKdFQeHdSTjJg8BYQW.jpg" }
  @{ dest = "public\templates\office\creed-bratton.jpg";   url = "https://image.tmdb.org/t/p/w500/8SXA5SFVS1yJEsRAFH1iyT9gPx2.jpg" }
  @{ dest = "public\templates\office\meredith-palmer.jpg"; url = "https://image.tmdb.org/t/p/w500/9I3g7v0TMRxY4MZEHFQONJi6CjG.jpg" }
  @{ dest = "public\templates\office\toby-flenderson.jpg"; url = "https://image.tmdb.org/t/p/w500/bNHwjMNsRF2ERcqdeFOEz5kMH2n.jpg" }
  @{ dest = "public\templates\office\kelly-kapoor.jpg";    url = "https://image.tmdb.org/t/p/w500/hJpKYdTESlWiS7wHXbmXoZwdRjV.jpg" }
  @{ dest = "public\templates\office\darryl-philbin.jpg";  url = "https://image.tmdb.org/t/p/w500/h3wbOSFdEQEQ5Xdk3GQMS0F6CXa.jpg" }
  @{ dest = "public\templates\marvel\hulk.jpg";            url = "https://image.tmdb.org/t/p/w500/1ZTBLBtIbCshMuJzUMFMGF9J7Et.jpg" }
  @{ dest = "public\templates\marvel\black-panther.jpg";   url = "https://image.tmdb.org/t/p/w500/2xlOpItZm1LmZvovNexFmUMfeBJ.jpg" }
  @{ dest = "public\templates\marvel\loki.jpg";            url = "https://image.tmdb.org/t/p/w500/MsHEzRfIDJYF9COvBHjRNPxiyM.jpg" }
  @{ dest = "public\templates\marvel\doctor-strange.jpg";  url = "https://image.tmdb.org/t/p/w500/A7CxjGkHqS0dNbBDaCqbYzBCDRG.jpg" }
  @{ dest = "public\templates\marvel\hawkeye.jpg";         url = "https://image.tmdb.org/t/p/w500/vGRIBMU12eVBPJqMzCY9CvYJFan.jpg" }
  @{ dest = "public\templates\marvel\scarlet-witch.jpg";   url = "https://image.tmdb.org/t/p/w500/msSfFqGUPRGEqxEv3cMvWBJoNQZ.jpg" }
  @{ dest = "public\templates\marvel\thanos.jpg";          url = "https://image.tmdb.org/t/p/w500/salHbwGnzSfYiqjFAVbPeHtT4ya.jpg" }
  @{ dest = "public\templates\marvel\nick-fury.jpg";       url = "https://image.tmdb.org/t/p/w500/8HFtGNqWqCfvOB4wKJClqr66OAP.jpg" }
  @{ dest = "public\templates\hollywood\brad-pitt.jpg";    url = "https://image.tmdb.org/t/p/w500/ajNaPmXVVMJFg9GWmu6MJzTaXdV.jpg" }
  @{ dest = "public\templates\hollywood\tom-cruise.jpg";   url = "https://image.tmdb.org/t/p/w500/3mShHjSQR7NXOVbdTu5rT2Qd0MN.jpg" }
  @{ dest = "public\templates\hollywood\keanu-reeves.jpg"; url = "https://image.tmdb.org/t/p/w500/8RZLOyYGsoRe9p44q3xin9QkMHv.jpg" }
  @{ dest = "public\templates\hollywood\emma-stone.jpg";   url = "https://image.tmdb.org/t/p/w500/t7EYLBMWQiIDtCoOYZjvqXV84S5.jpg" }
  @{ dest = "public\templates\hollywood\ryan-gosling.jpg"; url = "https://image.tmdb.org/t/p/w500/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg" }
  @{ dest = "public\templates\hollywood\anne-hathaway.jpg"; url = "https://image.tmdb.org/t/p/w500/nbccV2pMoyLTCeg5DQip24Eq0Jp.jpg" }
  @{ dest = "public\templates\hollywood\jennifer-lawrence.jpg"; url = "https://image.tmdb.org/t/p/w500/6WTY6HjXMGxnHilJRVC3eLnu43F.jpg" }
  @{ dest = "public\templates\hollywood\leo-dicaprio.jpg"; url = "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" }
  @{ dest = "public\templates\hollywood\zendaya.jpg";      url = "https://image.tmdb.org/t/p/w500/6TE2AlOUqVMqZa0pr0KjUV0aMak.jpg" }
)
$ok = 0; $fail = 0
$headers = @{'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
foreach ($img in $images) {
  Write-Host "Downloading $($img.dest)..." -NoNewline
  try {
    Invoke-WebRequest -Uri $img.url -OutFile $img.dest -UseBasicParsing -TimeoutSec 15 -Headers $headers
    $size = (Get-Item $img.dest).Length
    if ($size -lt 5000) { Write-Host " SMALL($size bytes)" ; $fail++ }
    else { Write-Host " OK($size bytes)" ; $ok++ }
  } catch { Write-Host " FAILED: $_" ; $fail++ }
}
Write-Host "`nDone. OK=$ok FAILED=$fail"
