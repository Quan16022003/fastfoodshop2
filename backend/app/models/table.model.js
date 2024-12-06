module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        tableNumber: {
            type: String,
            required: true,
            unique: true,
        },
        
        qrCode: { type: String, unique: true }, // Lưu trữ URL hoặc dữ liệu của mã QR
        isAvailable: { type: Boolean, default: true },
        status: { type: String, enum: ['Trống', 'Đã đặt', 'Đang sử dụng'], default: 'Trống' },
        seatingCapacity: { 
            type: Number, 
            required: true,
            min: 1 
        },
        location: { 
            type: String,
            enum: ['trong nhà', 'ngoài trời', 'tầng 1', 'tầng 2'],
            required: true 
        }
      }
    );
  
    const Table = mongoose.model('table', schema);
  
    return Table;
  };