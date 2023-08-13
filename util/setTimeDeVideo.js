const fs = require('fs');
const { exec } = require('child_process');
function setTimeDeleteVideo(url){



const fileToDelete = url;
const deletionDelay = 60000; // Thời gian chờ trước khi xóa file (60 giây)

setTimeout(() => {
  // Kiểm tra xem file có tồn tại không
  fs.access(fileToDelete, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist');
      return;
    }

    // Xóa file bằng lệnh hệ thống
    fs.unlink(fileToDelete, (err) => {
        if (err) console.log(err);
      });
  });
}, deletionDelay);
}
module.exports = setTimeDeleteVideo;