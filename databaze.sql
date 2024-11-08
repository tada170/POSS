

-- Tabulka pro uživatelské role
CREATE TABLE Role (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    NazevRole VARCHAR(50) NOT NULL
);
GO

-- Tabulka pro uživatele
CREATE TABLE Uzivatel (
    UzivatelID INT IDENTITY(1,1) PRIMARY KEY,
    Jmeno VARCHAR(255) NOT NULL,
    Prijmeni VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Heslo VARCHAR(255) NOT NULL,
    RoleID INT,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
);
GO

-- Tabulka pro alergeny
CREATE TABLE Alergen (
    AlergenID INT IDENTITY(1,1) PRIMARY KEY,
    Nazev VARCHAR(50) NOT NULL
);
GO

-- Tabulka pro kategorie
CREATE TABLE Kategorie (
    KategorieID INT IDENTITY(1,1) PRIMARY KEY,
    Nazev VARCHAR(50) NOT NULL
);
GO

-- Tabulka pro produkty
CREATE TABLE Produkt (
    ProduktID INT IDENTITY(1,1) PRIMARY KEY,
    Nazev VARCHAR(50) NOT NULL,
    Cena DECIMAL(10, 2) NOT NULL,
    KategorieID INT,
    FOREIGN KEY (KategorieID) REFERENCES Kategorie(KategorieID) ON DELETE SET NULL
);
GO

-- Tabulka pro spojení produktů a alergenů
CREATE TABLE ProduktAlergen (
    ProduktID INT,
    AlergenID INT,
    PRIMARY KEY (ProduktID, AlergenID),
    FOREIGN KEY (ProduktID) REFERENCES Produkt(ProduktID) ON DELETE CASCADE,
    FOREIGN KEY (AlergenID) REFERENCES Alergen(AlergenID) ON DELETE CASCADE
);
GO

-- Tabulka pro transakce
CREATE TABLE Transakce (
    Nazev varchar(50) NOT NULL,
    TransakceID INT IDENTITY(1,1) PRIMARY KEY,
    UzivatelID INT,
    DatumTransakce DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UzivatelID) REFERENCES Uzivatel(UzivatelID)
);
GO

-- Tabulka pro položky transakce
CREATE TABLE PolozkaTransakce (
    PolozkaTransakceID INT IDENTITY(1,1) PRIMARY KEY,
    TransakceID INT,
    ProduktID INT,
    Mnozstvi INT NOT NULL,
    Cena DECIMAL(10, 2) NOT NULL,
    Zaplaceno BIT DEFAULT 0,
    FOREIGN KEY (TransakceID) REFERENCES Transakce(TransakceID),
    FOREIGN KEY (ProduktID) REFERENCES Produkt(ProduktID)
);
GO

-- Tabulka pro denní tržby
CREATE TABLE DenniTrzba (
    TrzbaID INT IDENTITY(1,1) PRIMARY KEY,
    Datum DATE NOT NULL,
    CelkovaTrzba DECIMAL(10, 2) NOT NULL
);
GO

-- Trigger pro automatické nastavení ceny položky
CREATE TRIGGER NastavCenuPolozky
ON PolozkaTransakce
INSTEAD OF INSERT
AS
BEGIN
    INSERT INTO PolozkaTransakce (TransakceID, ProduktID, Mnozstvi, Cena)
    SELECT i.TransakceID, 
           i.ProduktID, 
           i.Mnozstvi, 
           i.Mnozstvi * p.Cena
    FROM inserted i
    JOIN Produkt p ON i.ProduktID = p.ProduktID;
END;
GO


-- Trigger pro aktualizaci denních tržeb při úhradě
CREATE TRIGGER AktualizaceDenniTrzbyNaZaplaceno
ON PolozkaTransakce
AFTER UPDATE
AS
BEGIN
    DECLARE @CelkovaTrzba DECIMAL(10, 2) = 0;
    DECLARE @AktualniDatum DATE = CAST(GETDATE() AS DATE);
    
    SELECT @CelkovaTrzba = SUM(Cena * Mnozstvi)
    FROM PolozkaTransakce
    WHERE TransakceID IN (SELECT TransakceID FROM inserted)
      AND Zaplaceno = 1;

    IF @CelkovaTrzba > 0
    BEGIN
        IF EXISTS (SELECT * FROM DenniTrzba WHERE Datum = @AktualniDatum)
        BEGIN
            UPDATE DenniTrzba
            SET CelkovaTrzba = CelkovaTrzba + @CelkovaTrzba
            WHERE Datum = @AktualniDatum;
        END
        ELSE
        BEGIN
            INSERT INTO DenniTrzba (Datum, CelkovaTrzba)
            VALUES (@AktualniDatum, @CelkovaTrzba);
        END
    END
END;
GO

-- Vložení vzorových kategorií
INSERT INTO Kategorie (Nazev) VALUES 
('Nápoje'), 
('Jídlo'), 
('Desert'), 
('Ostatní');
GO

-- Vložení vzorových produktů
INSERT INTO Produkt (Nazev, Cena, KategorieID) VALUES 
('Káva', 50.00, 1), 
('Čaj', 30.00, 1), 
('Koláč', 40.00, 2);
GO
-- Vložení vzorových rolí
INSERT INTO Role (NazevRole) VALUES 
('Admin'), 
('User'), 
('Guest');

-- Vložení vzorového uživatele
INSERT INTO Uzivatel (Jmeno, Prijmeni, Email, Heslo, RoleID) VALUES 
('Jan', 'Novák', 'jan.novak@example.com', 'heslo123', 1);
GO
-- Vložení vzorové transakce
INSERT INTO Transakce (UzivatelID) VALUES (3);
GO
-- Vložení položek do transakce
INSERT INTO PolozkaTransakce (TransakceID, ProduktID, Mnozstvi) VALUES (3, 1, 2); -- 2x Káva
INSERT INTO PolozkaTransakce (TransakceID, ProduktID, Mnozstvi) VALUES (3, 2, 3); -- 3x Čaj
GO
-- Aktuální stav položek transakce
SELECT * FROM PolozkaTransakce;
GO

-- Aktualizace stavu zaplacení pro příklad
UPDATE PolozkaTransakce
SET Zaplaceno = 1
WHERE PolozkaTransakceID = 7;  -- Například aktualizace první položky
GO

-- Kontrola denní tržby
SELECT * FROM DenniTrzba;
GO

DELETE FROM PolozkaTransakce;
DELETE FROM ProduktAlergen;
DELETE FROM Transakce;
DELETE FROM Uzivatel;
DELETE FROM Produkt;
DELETE FROM Kategorie;
DELETE FROM Alergen;
DELETE FROM DenniTrzba;

DROP TABLE IF EXISTS PolozkaTransakce;
DROP TABLE IF EXISTS ProduktAlergen;
DROP TABLE IF EXISTS Transakce;
DROP TABLE IF EXISTS Uzivatel;
DROP TABLE IF EXISTS Produkt;
DROP TABLE IF EXISTS Kategorie;
DROP TABLE IF EXISTS Alergen;
DROP TABLE IF EXISTS DenniTrzba;
DROP TABLE IF EXISTS Role;


