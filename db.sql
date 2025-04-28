-- USERS TABLE
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    ProfilePic TEXT,
    PasswordHash TEXT NOT NULL,
    RollNumber VARCHAR(20) UNIQUE,
    Hostel VARCHAR(50),
    RoomNumber VARCHAR(10),
    EmailVerified BOOLEAN DEFAULT FALSE
);

-- OTP VERIFICATION TABLE
CREATE TABLE OTP_Verification (
    OTPID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(100) NOT NULL,
    OTPCode VARCHAR(6) NOT NULL,
    ExpiresAt DATETIME NOT NULL
);

-- CATEGORY TABLE
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    CategoryName VARCHAR(50) UNIQUE NOT NULL,
    Description TEXT
);

-- FOUND ITEMS TABLE
CREATE TABLE FoundItems (
    FoundItemID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    FoundDate DATE NOT NULL,
    FoundLocation VARCHAR(255) NOT NULL,
    PickupLocation VARCHAR(255),
    SecurityQuestion TEXT NOT NULL,
    SecurityAnswerHash TEXT NOT NULL,
    PostedBy INT,
    CategoryID INT,
    FOREIGN KEY (PostedBy) REFERENCES Users(UserID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- FOUND ITEM PHOTOS
CREATE TABLE FoundItemPhotos (
    PhotoID INT PRIMARY KEY AUTO_INCREMENT,
    FoundItemID INT,
    PhotoURL TEXT,
    FOREIGN KEY (FoundItemID) REFERENCES FoundItems(FoundItemID)
);

-- LOST ITEMS TABLE
CREATE TABLE LostItems (
    LostItemID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    LostDate DATE NOT NULL,
    LostLocation VARCHAR(255),
    PostedBy INT,
    CategoryID INT,
    FOREIGN KEY (PostedBy) REFERENCES Users(UserID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- LOST ITEM PHOTOS
CREATE TABLE LostItemPhotos (
    PhotoID INT PRIMARY KEY AUTO_INCREMENT,
    LostItemID INT,
    PhotoURL TEXT,
    FOREIGN KEY (LostItemID) REFERENCES LostItems(LostItemID)
);

-- CLAIM TABLE
CREATE TABLE Claims (
    ClaimID INT PRIMARY KEY AUTO_INCREMENT,
    FoundItemID INT,
    ClaimingUserID INT,
    SecurityAnswerAttempt TEXT,
    Status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    Message TEXT,
    FOREIGN KEY (FoundItemID) REFERENCES FoundItems(FoundItemID),
    FOREIGN KEY (ClaimingUserID) REFERENCES Users(UserID)
);

-- REPORT LOST ITEM FOUND TABLE
CREATE TABLE ReportedLostFound (
    ReportID INT PRIMARY KEY AUTO_INCREMENT,
    LostItemID INT,
    Message TEXT,
    Status ENUM('Pending', 'Returned') DEFAULT 'Pending',
    UserWhoFound INT,
    PickupLocation VARCHAR(255),
    FOREIGN KEY (LostItemID) REFERENCES LostItems(LostItemID),
    FOREIGN KEY (UserWhoFound) REFERENCES Users(UserID)
);
DROP TABLE IF exists reportedlostfound;