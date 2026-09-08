$images = @(
  @{ dest = "public\templates\office\oscar-martinez.jpg";  url = "https://image.tmdb.org/t/p/w500/UBILHiRphJdlshvsyH920QSAhk.jpg" }
  @{ dest = "public\templates\office\stanley-hudson.jpg";  url = "https://image.tmdb.org/t/p/w500/9h3xlV5IYqKinlQCW1ouU7sjwWF.jpg" }
  @{ dest = "public\templates\office\phyllis-vance.jpg";   url = "https://image.tmdb.org/t/p/w500/h9w9pQbiderRWAC2mi7spjzuIGz.jpg" }
  @{ dest = "public\templates\office\creed-bratton.jpg";    url = "https://image.tmdb.org/t/p/w500/r1VWJSP2c29qSj5PA6wMOe7RdVz.jpg" }
  @{ dest = "public\templates\office\meredith-palmer.jpg";  url = "https://image.tmdb.org/t/p/w500/wFXWKB2IUyB6Cu08PyovyBAm9WT.jpg" }
  @{ dest = "public\templates\office\toby-flenderson.jpg";  url = "https://image.tmdb.org/t/p/w500/oLCaNVAw5cfE5q4e0PRsmHTuHfd.jpg" }
  @{ dest = "public\templates\office\kelly-kapoor.jpg";     url = "https://image.tmdb.org/t/p/w500/m4veWEp9TEDallTZRobb7MLkd9K.jpg" }
  @{ dest = "public\templates\office\darryl-philbin.jpg";   url = "https://image.tmdb.org/t/p/w500/mTyTrOWUSOBJMOlDpnd4OYx7FlJ.jpg" }

  @{ dest = "public\templates\marvel\hulk.jpg";            url = "https://image.tmdb.org/t/p/w500/5GilHMOt5PAQh6rlUKZzGmaKEI7.jpg" }
  @{ dest = "public\templates\marvel\loki.jpg";            url = "https://image.tmdb.org/t/p/w500/mclHxMm8aPlCPKptP67257F5GPo.jpg" }
  @{ dest = "public\templates\marvel\doctor-strange.jpg";  url = "https://image.tmdb.org/t/p/w500/wz3MRiMmoz6b5X3oSzMRC9nLxY1.jpg" }
  @{ dest = "public\templates\marvel\thanos.jpg";          url = "https://image.tmdb.org/t/p/w500/sX2etBbIkxRaCsATyw5ZpOVMPTD.jpg" }
)

$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

foreach ($img in $images) {
  $dest = $img.dest
  $url  = $img.url
  $dir  = Split-Path -Parent $dest
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  Write-Host "Downloading $url to $dest ..."
  try {
    $wc.DownloadFile($url, $dest)
    $size = (Get-Item $dest).Length
    Write-Host "  Success! Size: $size bytes"
  } catch {
    Write-Host "  Error downloading ${dest}: $_"
  }
}
