const db = require("../models");
const Table = db.table;
const QRCode = require('qrcode');

// Lấy thông tin bàn theo mã QR
exports.getTableByQRCode = async (req, res) => {
  try {
    const qrCode = req.params.qrCode;
    const table = await Table.findOne({ qrCode });

    if (!table) {
      return res.status(404).json({ message: 'Bàn không tồn tại.' });
    }

    if (!table.isAvailable) {
      return res.status(400).json({ message: 'Bàn đã được đặt hoặc không thể sử dụng' });
    }

    res.json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Thêm bàn mới
exports.addTable = async (req, res) => {
  try {
    const { tableNumber, seatingCapacity, location } = req.body;
    if (!tableNumber || !seatingCapacity || !location) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
    }

    if(seatingCapacity < 1) {
        return res.status(400).json({ message: 'Sức chứa phải lớn hơn 0.' });
    }
    const newTable = new Table({ tableNumber, seatingCapacity, location });
    await newTable.save();
    
    // Tạo dữ liệu để mã hóa vào QR
    const qrData = {
      tableId: newTable._id,
      tableNumber: newTable.tableNumber,
      location: newTable.location
    };

    // Tạo mã QR dạng URL data
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

    // Cập nhật mã QR vào bảng
    newTable.qrCode = qrCodeDataURL;
    await newTable.save();

    res.status(201).json(newTable);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.tableNumber) {
        return res.status(400).json({message: 'Số bàn đã tồn tại'});
    }
    console.error(error);
    res.status(400).json({ message: 'Lỗi khi thêm bàn mới.' });
  }
};

// Sửa thông tin bàn
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedTable = await Table.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedTable) {
      return res.status(404).json({ message: 'Bàn không tồn tại.' });
    }
    res.json(updatedTable);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Lỗi khi cập nhật thông tin bàn.' });
  }
};

// Xóa bàn
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTable = await Table.findByIdAndDelete(id);
    if (!deletedTable) {
      return res.status(404).json({ message: 'Bàn không tồn tại.' });
    }
    res.json({ message: 'Xóa bàn thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa bàn.' });
  }
};

exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy tất cả bàn.' });
  }
};

exports.startUsingTable = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTable = await Table.findByIdAndUpdate(
            id, 
            { 
                status: 'Đang sử dụng',
                isAvailable: false 
            },
            { new: true }
        );
        
        if (!updatedTable) {
            return res.status(404).json({ message: 'Bàn không tồn tại.' });
        }
        
        res.json(updatedTable);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Lỗi khi cập nhật trạng thái bàn.' });
    }
};
