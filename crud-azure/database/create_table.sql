-- รันไฟล์นี้ใน Azure Portal > SQL database > Query editor
CREATE TABLE Students (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(100) NOT NULL,
    email      NVARCHAR(100) NOT NULL,
    major      NVARCHAR(100) NULL,
    created_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- ข้อมูลตัวอย่าง
INSERT INTO Students (name, email, major) VALUES
(N'สมชาย ใจดี', N'somchai@example.com', N'วิทยาการคอมพิวเตอร์'),
(N'สมหญิง รักเรียน', N'somying@example.com', N'เทคโนโลยีสารสนเทศ');

SELECT * FROM Students;
