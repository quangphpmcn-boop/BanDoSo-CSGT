import json

data = {
    "db1": {
        "wards": ["Ngô Quyền", "Đông Hải", "Lê Chân", "Hải An", "Gia Viên", "An Hải", "An Biên", "Hồng Bàng"],
        "routes": [
            "Nguyễn Trãi", "Lê Thánh Tông", "Nguyễn Văn Linh", "Nguyễn Bỉnh Khiêm", "Lê Hồng Phong", "Tôn Đức Thắng", "Trần Nguyên Hãn (từ ngã tư Tam Kỳ đến giữa cầu Niệm)", "đường vòng cầu Niệm", "Tô Hiệu", "Chùa Vẽ", "Phan Chu Trinh"
        ]
    },
    "db2": {
        "wards": ["Hải An", "Lê Chân", "Kiến An", "An Hải", "An Phong", "An Dương", "Gia Viên", "Dương Kinh", "Hưng Đạo", "Nam Đồ Sơn", "Đồ Sơn", "Kiến Thụy", "Kiến Minh", "Kiến Hải", "Kiến Hưng", "Nghi Dương", "Tiên Lãng", "Tiên Minh", "Chấn Hưng", "Hùng Thắng", "Tân Minh"],
        "routes": [
            "Cầu Đất", "Lạch Tray", "Phạm Văn Đồng", "đường dẫn lên, xuống đường cao tốc HN-HP-QN", "Võ Nguyên Giáp", "Bùi Viện (từ ngã 6 Bùi Viện - Lê Hồng Phong đến cầu vượt Lãm Khê)", "Nguyễn Trường Tộ (Từ cầu vượt Lãm Khê đến ngã tư Nguyễn Trường Tộ - Quốc lộ 10)"
        ]
    },
    "db3": {
        "wards": ["Hồng Bàng", "An Hải", "Lê Chân", "Hồng An"],
        "routes": [
            "Hoàng Diệu", "Nguyễn Tri Phương", "Nguyễn Đức Cảnh (từ ngã tư Tam Kỳ đến cầu đường bộ Tam Bạc)", "Bạch Đằng", "Hùng Vương (từ cầu đường bộ Tam Bạc đến ngã tư Quán Toan)", "Hồng Bàng", "Trần Nguyên Hãn (từ ngã tư Trần Nguyên Hãn - Tô Hiệu đến ngã tư Trần Nguyên Hãn - Nguyễn Đức Cảnh)", "đường cầu Bính (Từ nút giao Nam cầu Bính đến giữa cầu Bính)", "đường từ nút giao Nam cầu Bính đến ngã năm Nguyễn Văn Linh - Tôn Đức Thắng"
        ]
    },
    "db4": {
        "wards": ["Hải An", "Đông Hải", "Cát Hải", "Bạch Long Vĩ"],
        "routes": [
            "Đường Chùa Vẽ", "Đình Vũ", "Mạc Thái Tổ", "Tân Vũ - Lạch Huyện", "Bùi Viện (từ đường liên phường đến ngã 6)", "đường liên phường", "đường Đặng Kinh"
        ]
    },
    "db5": {
        "wards": ["Nguyễn Trãi", "Trần Hưng Đạo", "Trần Nhân Tông", "Chu Văn An", "Chí Linh", "Lê Đại Hành", "Nam Sách", "Hợp Tiến", "Trần Phú", "An Phú", "Thái Tân", "Cẩm Giàng", "Cẩm Giang", "Tuệ Tĩnh", "Mao Điền", "Kẻ Sặt", "Thượng Hồng", "Đường An", "Bình Giang", "Tứ Minh", "Việt Hoà", "Lê Thanh Nghị", "Hải Dương", "Thành Đông", "Thạch Khôi", "Tân Hưng", "Ái Quốc", "Nam Đồng", "Lai Khê", "Phú Thái", "Hà Bắc", "Hà Nam", "Hà Tây", "Thanh Hà", "Nguyễn Đại Năng", "Nhị Chiều", "Kinh Môn", "Phạm Sư Mạnh", "Trần Liễu", "Bắc An Phụ", "Nam An Phụ", "Nam Thanh Miện", "Thanh Miện", "Bắc Thanh Miện", "Hải Hưng", "Nguyễn Lương Bằng", "Gia Lộc", "Trường Tân", "Gia Phúc", "Yết Kiêu"],
        "routes": [
            "Quốc lộ 18", "Quốc lộ 38", "Quốc lộ 38B", "Quốc lộ 5 từ Km 33+720 đến Km 77+830", "Quốc lộ 37 từ Km 42+100 đến Km 99+680", "Quốc lộ 17B từ Km1+337 đến Km 14+300"
        ]
    },
    "tram_an_hung": {
        "wards": ["An Dương", "Hồng An", "Kiến An", "Phù Liễn", "An Phong", "An Hải", "An Thành", "Kim Thành"],
        "routes": [
            "Quốc lộ 5 từ km77+830 đến km92+650", "Quốc lộ 10 từ Km20+400 đến Km30+968", "Quốc lộ 17B từ Km 15+500 đến Km28+890", "Đường Hùng Vương (từ ngã tư Quán Toan đến ngã tư cầu vượt Quán Toan)", "Đường dẫn từ điểm qua ngã tư Long Thành", "Đường dẫn từ ngã ba cây xăng Bắc Hà"
        ]
    },
    "tram_luu_kiem": {
        "wards": ["Thủy Nguyên", "Nam Triệu", "Hòa Bình", "Bạch Đằng", "Lưu Kiếm", "Lê Ích Mộc", "Thiên Hương", "Việt Khê"],
        "routes": [
            "Quốc lộ 10: Từ Km6+500 đến Km20+400", "ĐT.359 từ ngã ba Tân Dương đến phà Rừng", "Đường cầu Bính từ giữa cầu Bính đến ngã tư Tân Dương"
        ]
    },
    "tram_quang_trung": {
        "wards": ["An Lão", "An Trường", "An Quang", "An Hưng", "An Khánh", "Vĩnh Thuận", "Vĩnh Thịnh", "Vĩnh Bảo", "Vĩnh Hòa", "Vĩnh Hải", "Vĩnh Am", "Nguyễn Bỉnh Khiêm", "Quyết Thắng", "Hà Đông", "Nguyên Giáp", "Lạc Phượng", "Tứ Kỳ", "Tân Kỳ", "Chí Minh", "Đại Sơn", "Ninh Giang", "Vĩnh Lại", "Khúc Thừa Dụ", "Tân An", "Hồng Châu"],
        "routes": [
            "Quốc lộ 10: Từ Km30+968 đến Km58+480", "Quốc lộ 37 từ Km 26+480 đến Km 42+100", "Các đường dẫn lên, xuống đường cao tốc HN-HP-QN thuộc xã An Quang"
        ]
    },
    "tram_dt_an_duong": {
        "wards": [],
        "routes": ["Tuyến sông Lạch Tray", "Tuyến sông Đào Hạ Lý: Từ ngã ba sông Rế đến ngã ba sông Lạch Tray", "Tuyến sông Rế"]
    },
    "tram_dt_may_chi": {
        "wards": [],
        "routes": ["Tuyến sông Cấm: từ đò Lâm đến thượng lưu cầu Hoàng Văn Thụ", "Tuyến sông Tam Bạc", "Tuyến sông đào Hạ Lý: Từ ngã ba sông Rế đến ngã ba sông Cấm"]
    },
    "tram_dt_bach_dang": {
        "wards": [],
        "routes": ["Tuyến sông Đá Bạch", "Tuyến sông Bạch Đằng: Từ ngã ba sông Giá, sông Bạch Đằng đến cửa Nam Triệu", "Tuyến sông Giá", "Tuyến sông Thái"]
    },
    "dt1": {
        "wards": [],
        "routes": ["Tuyến Kênh Cái Tráp", "Tuyến Kênh Hà Nam", "Tuyến sông Chanh", "Tuyến Ba Mom", "Luồng Lạch Huyện", "Luồng Nam Triệu", "Tuyến ven biển đảo Cát Bà", "Lạch Cái Viềng", "Lạch Phù Long", "Lạch Hòa Quang", "Các tuyến cửa sông, ven biển thuộc nội thủy đặc khu Cát Hải, phường Đông Hải", "Tuyến sông Cấm: từ cầu Hoàng Văn Thụ đến ngã ba sông Cấm, dọc theo bờ", "Tuyến sông Ruột Lợn", "Tuyến sông Cấm: Từ ngã ba Nống đến thượng lưu bến đò Lâm"]
    },
    "dt2": {
        "wards": [],
        "routes": ["Tuyến sông Văn Úc", "Tuyến sông Mới", "Tuyến sông Thái Bình, từ cầu Quý Cao đến cửa sông Thái Bình", "Tuyến sông Luộc", "Tuyến sông Hóa", "Tuyến sông Đa Độ"]
    },
    "dt3": {
        "wards": [],
        "routes": ["Tuyến sông Kinh Môn", "Tuyến sông Kinh Thầy", "Tuyến sông Hàn", "Tuyến sông Phi Liệt", "Tuyến sông Mạo Khê", "Tuyến sông Lai Vu", "Tuyến sông Thái Bình từ Ngã ba Cầu Xe đến ngã ba Lấu Khê", "Tuyến sông Gùa và Văn Úc", "Các tuyến sông Sặt, sông Cửu Yên, sông Đình Đào, sông Tứ Kỳ, sông Cầu Xe, sông Ghê"]
    }
}

try:
    with open('H:\\Bandoso\\data\\ward-unit-mapping.json', 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
except Exception:
    existing_data = {}

# Merge the lists without overwriting the qh_* entries if they exist
existing_data.update(data)

with open('H:\\Bandoso\\data\\ward-unit-mapping.json', 'w', encoding='utf-8') as f:
    json.dump(existing_data, f, ensure_ascii=False, indent=2)

print("Updated mapping successfully.")
