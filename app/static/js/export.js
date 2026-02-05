// export.js

// Download poster div as PNG
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("downloadBtn");
  const poster = document.getElementById("poster");

  if (!btn || !poster) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = "Exporting...";

    try {
      const dataUrl = await window.htmlToImage.toPng(poster, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "urania-compatibility.png";
      a.click();
    } catch (e) {
      alert("Export failed. Try again.");
      console.error(e);
    } finally {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  });
});
