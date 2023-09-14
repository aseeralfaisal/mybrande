export class DownloadImg {
    constructor(data, filename = 'logo.jpeg') {
      this.data = data;
      this.filename = filename;
    }
  
    downloadImage() {
      const a = document.createElement('a');
      a.href = this.data;
      a.download = this.filename;
      document.body.appendChild(a);
      a.click();
    }
  }
  