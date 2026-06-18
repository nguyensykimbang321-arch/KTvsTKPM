-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: bookingpro
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customerId` int NOT NULL,
  `staffId` int NOT NULL,
  `serviceId` int NOT NULL,
  `bookingDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `status` enum('draft','pending','confirmed','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `note` text COLLATE utf8mb4_unicode_ci,
  `totalAmount` decimal(10,2) NOT NULL,
  `cancelledAt` datetime DEFAULT NULL,
  `cancelReason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_customer` (`customerId`,`status`),
  KEY `idx_booking_staff_date` (`staffId`,`bookingDate`,`startTime`),
  KEY `idx_booking_status` (`status`),
  KEY `serviceId` (`serviceId`),
  KEY `bookings_customer_id_status` (`customerId`,`status`),
  KEY `bookings_staff_id_booking_date_start_time` (`staffId`,`bookingDate`,`startTime`),
  KEY `bookings_status` (`status`),
  CONSTRAINT `bookings_ibfk_28` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_29` FOREIGN KEY (`staffId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_30` FOREIGN KEY (`serviceId`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,4,2,1,'2024-05-10','09:00:00','10:00:00','cancelled',NULL,250000.00,'2026-05-14 02:32:29','Đổi lịch hẹn khác','2026-05-03 17:20:49','2026-05-14 02:32:29'),(2,4,3,3,'2024-05-12','14:00:00','15:30:00','completed',NULL,600000.00,NULL,NULL,'2026-05-03 17:20:49','2026-05-14 02:31:24'),(3,4,3,4,'2024-04-25','10:00:00','11:00:00','completed',NULL,350000.00,NULL,NULL,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(4,4,2,2,'2024-04-20','15:00:00','17:00:00','cancelled',NULL,800000.00,NULL,NULL,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(5,4,5,5,'2024-04-15','09:00:00','09:30:00','completed',NULL,150000.00,NULL,NULL,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(9,1,3,4,'2026-05-03','09:00:00','09:45:00','cancelled',NULL,350000.00,'2026-05-12 13:43:00','Đổi lịch hẹn khác','2026-05-03 14:26:32','2026-05-12 13:43:00'),(10,1,2,1,'2026-05-03','09:00:00','10:00:00','cancelled',NULL,250000.00,'2026-05-12 13:43:04','Đổi lịch hẹn khác','2026-05-03 14:43:22','2026-05-12 13:43:04'),(11,1,7,7,'2026-05-14','11:00:00','12:15:00','completed',NULL,500000.00,NULL,NULL,'2026-05-14 02:10:44','2026-06-18 12:32:16'),(12,4,2,2,'2026-06-25','11:00:00','13:00:00','cancelled',NULL,800000.00,'2026-06-18 12:05:11','Đổi lịch hẹn khác','2026-06-18 12:03:18','2026-06-18 12:05:11'),(13,8,7,7,'2026-06-19','08:00:00','09:15:00','confirmed',NULL,500000.00,NULL,NULL,'2026-06-18 12:31:21','2026-06-18 12:32:19');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Cắt & Tạo kiểu','Các dịch vụ liên quan đến cắt tóc, tạo mẫu tóc nam nữ.','Scissors','2026-05-03 18:04:08','2026-05-03 18:04:08'),(2,'Nhuộm & Hóa chất','Uốn, duỗi, nhuộm màu thời trang.','Droplets','2026-05-03 18:04:08','2026-05-03 18:04:08'),(3,'Massage & Spa','Thư giãn toàn thân và chăm sóc chuyên sâu.','Sparkles','2026-05-03 18:04:08','2026-05-03 18:04:08'),(4,'Làm móng','Chăm sóc móng tay và móng chân.','Sticker','2026-05-03 18:04:08','2026-05-03 18:04:08');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `bookingId` int DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('booking_created','booking_confirmed','booking_completed','booking_cancelled','payment_success','payment_refund') COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notification_user` (`userId`,`isRead`),
  KEY `bookingId` (`bookingId`),
  KEY `notifications_user_id_is_read` (`userId`,`isRead`),
  CONSTRAINT `notifications_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_20` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,1,'Lịch đặt thành công','Lịch đặt dịch vụ Cắt tóc & Gội đầu của bạn đã được xác nhận.','booking_confirmed',0,'2026-05-03 17:20:49','2026-05-03 17:20:49'),(2,2,NULL,'Lịch hẹn mới','Khách hàng Hệ thống Quản trị vừa đặt dịch vụ #7','booking_created',0,'2026-05-03 14:14:43','2026-05-03 14:14:43'),(3,2,NULL,'Lịch hẹn mới','Khách hàng Hệ thống Quản trị vừa đặt dịch vụ #8','booking_created',0,'2026-05-03 14:19:15','2026-05-03 14:19:15'),(4,1,9,'Thanh toán thành công','Thanh toán cho booking #9 đã thành công. Số tiền: 350000.00 VNĐ','payment_success',0,'2026-05-03 14:27:16','2026-05-03 14:27:16'),(5,2,10,'Lịch hẹn mới','Khách hàng Hệ thống Quản trị vừa đặt dịch vụ #10','booking_created',0,'2026-05-03 14:43:22','2026-05-03 14:43:22'),(6,1,11,'Lịch hẹn được xác nhận','Lịch hẹn #11 của bạn đã được nhân viên David Vu xác nhận','booking_confirmed',0,'2026-05-14 02:13:07','2026-05-14 02:13:07'),(7,4,2,'Lịch hẹn được xác nhận','Lịch hẹn #2 của bạn đã được nhân viên Sophia Tran xác nhận','booking_confirmed',0,'2026-05-14 02:25:42','2026-05-14 02:25:42'),(8,2,12,'Lịch hẹn mới','Khách hàng Khách Hàng DEMO vừa đặt dịch vụ #12','booking_created',0,'2026-06-18 12:03:18','2026-06-18 12:03:18'),(9,7,13,'Lịch hẹn mới','Khách hàng Kim Bang vừa đặt dịch vụ #13','booking_created',0,'2026-06-18 12:31:21','2026-06-18 12:31:21'),(10,8,13,'Lịch hẹn được xác nhận','Lịch hẹn #13 của bạn đã được nhân viên David Vu xác nhận','booking_confirmed',0,'2026-06-18 12:32:19','2026-06-18 12:32:19');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('vnpay','cod') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','success','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `transactionId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vnpayResponseCode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refundAmount` decimal(10,2) DEFAULT '0.00',
  `paidAt` datetime DEFAULT NULL,
  `refundedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookingId` (`bookingId`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,250000.00,'vnpay','pending',NULL,NULL,0.00,'2024-05-01 10:00:00',NULL,'2026-05-03 17:20:49','2026-05-03 12:32:22'),(2,3,350000.00,'cod','success',NULL,NULL,0.00,'2024-04-25 11:30:00',NULL,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(3,5,150000.00,'cod','success',NULL,NULL,0.00,'2024-04-15 10:00:00',NULL,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(7,9,350000.00,'vnpay','success','15520546','00',0.00,'2026-05-03 14:27:16',NULL,'2026-05-03 14:26:32','2026-05-03 14:27:16'),(8,11,500000.00,'vnpay','pending',NULL,NULL,0.00,NULL,NULL,'2026-05-14 02:10:44','2026-05-14 02:10:44');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `durationMinutes` int NOT NULL,
  `imageUrl` text COLLATE utf8mb4_unicode_ci,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,1,'Cắt tóc & Gội đầu','Combo cắt tóc tạo kiểu theo xu hướng và gội đầu dưỡng sinh thư giãn.',250000.00,60,'[\"https://png.pngtree.com/thumb_back/fh260/background/20230516/pngtree-video-of-a-young-man-getting-his-haircut-image_2570259.jpg\", \"https://www.shutterstock.com/image-photo/unrecognisable-hairdresser-cutting-female-client-260nw-2667741785.jpg\",\"https://media.istockphoto.com/id/640274128/vi/anh/th%E1%BB%A3-c%E1%BA%AFt-t%C3%B3c-s%E1%BB%AD-d%E1%BB%A5ng-k%C3%A9o-v%C3%A0-l%C6%B0%E1%BB%A3c.jpg?s=612x612&w=0&k=20&c=o82ARZnhqPdFAqU6WOWLnnP-Z7dGi22crXtevsOguAU=\",\"https://png.pngtree.com/thumb_back/fh260/background/20230309/pngtree-a-skilled-female-barber-giving-a-stylish-haircut-to-a-male-customer-in-a-professional-hair-salon-photo-image_50282924.jpg\"]',1,'2026-05-03 17:20:49','2026-05-03 18:04:08'),(2,1,'Nhuộm màu thời trang','Sử dụng thuốc nhuộm cao cấp, tư vấn màu sắc phù hợp với khuôn mặt.',800000.00,120,'https://easysalon.vn/wp-content/uploads/2020/09/kinh-nghiem-chon-keo-cat-toc-1.jpg',1,'2026-05-03 17:20:49','2026-05-03 18:04:08'),(3,2,'Uốn tóc Setting','Tạo kiểu tóc xoăn bồng bềnh, giữ nếp lâu dài.',600000.00,90,'https://media.istockphoto.com/id/1055100458/vi/anh/th%E1%BB%A3-l%C3%A0m-t%C3%B3c-%C4%91ang-c%E1%BA%AFt-t%C3%B3c-d%C3%A0i-trong-ti%E1%BB%87m-l%C3%A0m-t%C3%B3c.jpg?s=170667a&w=0&k=20&c=jWwpcI0i1dYzbn--BZJHA2HNF1g6kmweLl_KL6v2LK8=',1,'2026-05-03 17:20:49','2026-05-03 18:04:09'),(4,2,'Massage da mặt','Massage kết hợp tinh dầu thiên nhiên, giúp da căng bóng khỏe mạnh.',350000.00,45,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTww3k2NDzsbSS9wkM6EQwph6IOb0f94DbTpg&s',1,'2026-05-03 17:20:49','2026-05-03 18:04:09'),(5,1,'Cạo râu & Massage mặt','Dịch vụ chăm sóc râu chuyên nghiệp kết hợp massage mặt thư giãn cho nam giới.',150000.00,30,'https://annaorganicnailspa.com/wp-content/uploads/2024/11/2510-15-1200x600.jpg',1,'2026-05-03 18:04:01','2026-05-03 18:04:08'),(6,4,'Làm móng (Manicure)','Cắt tỉa móng tay, tạo kiểu và sơn màu theo yêu cầu.',200000.00,45,'https://www.elle.vn/wp-content/uploads/2021/12/03/459164/mau-nail-dep-cho-mua-giang-sinh-21-1024x1024.jpg',1,'2026-05-03 18:04:01','2026-05-03 18:04:09'),(7,3,'Chăm sóc da mụn','Liệu trình chuyên sâu dành cho da mụn, sử dụng dược phẩm an toàn.',500000.00,75,'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500',1,'2026-05-03 18:04:01','2026-05-03 18:04:09'),(8,3,'Tẩy tế bào chết toàn thân','Sử dụng muối khoáng và tinh dầu giúp làn da sáng mịn.',400000.00,60,'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',1,'2026-05-03 18:04:01','2026-05-03 18:04:09');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_schedules`
--

DROP TABLE IF EXISTS `staff_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staffId` int NOT NULL,
  `serviceId` int NOT NULL,
  `dayOfWeek` enum('MON','TUE','WED','THU','FRI','SAT','SUN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff_schedule` (`staffId`,`serviceId`,`dayOfWeek`,`startTime`),
  UNIQUE KEY `staff_schedules_staff_id_service_id_day_of_week_start_time` (`staffId`,`serviceId`,`dayOfWeek`,`startTime`),
  KEY `serviceId` (`serviceId`),
  CONSTRAINT `staff_schedules_ibfk_19` FOREIGN KEY (`staffId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `staff_schedules_ibfk_20` FOREIGN KEY (`serviceId`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_schedules`
--

LOCK TABLES `staff_schedules` WRITE;
/*!40000 ALTER TABLE `staff_schedules` DISABLE KEYS */;
INSERT INTO `staff_schedules` VALUES (19,2,1,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(20,2,1,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(21,2,1,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(22,2,1,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(23,3,1,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(24,3,1,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(25,3,1,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(26,2,2,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(27,2,2,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(28,2,2,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(29,2,2,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(30,5,2,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(31,5,2,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(32,5,2,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(33,3,3,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(34,3,3,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(35,3,3,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(36,3,3,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(37,3,3,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(38,6,3,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(39,6,3,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(40,3,4,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(41,3,4,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(42,3,4,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(43,3,4,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(44,3,4,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(45,3,4,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(46,7,4,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(47,5,5,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(48,5,5,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(49,5,5,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(50,5,5,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(51,5,5,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(52,7,5,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(53,7,5,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(54,6,6,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(55,6,6,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(56,6,6,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(57,6,6,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(58,6,6,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(59,2,6,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(60,2,6,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(61,7,7,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(62,7,7,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(63,7,7,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(64,7,7,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(65,7,7,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(66,5,7,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(67,5,7,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(68,6,8,'MON','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(69,6,8,'TUE','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(70,6,8,'WED','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(71,6,8,'THU','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(72,6,8,'FRI','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(73,6,8,'SAT','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00'),(74,7,8,'SUN','08:00:00','20:00:00',1,'2026-06-18 12:19:00','2026-06-18 12:19:00');
/*!40000 ALTER TABLE `staff_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','staff','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'customer',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Hệ thống Quản trị','admin@a.com','0900000001','$2a$10$fAlah95cSp6Lk0Ddm/elS.uh7omwNY33.TfPE3ABHDTKeeVUKpqDK','admin',1,'2026-05-03 17:20:49','2026-05-03 17:20:49'),(2,'Alex Nguyen','staff1@a.com','0900000002','$2a$10$fAlah95cSp6Lk0Ddm/elS.uh7omwNY33.TfPE3ABHDTKeeVUKpqDK','staff',1,'2026-05-03 17:20:49','2026-05-03 17:20:49'),(3,'Sophia Tran','staff2@a.com','0900000003','$2a$10$fAlah95cSp6Lk0Ddm/elS.uh7omwNY33.TfPE3ABHDTKeeVUKpqDK','staff',1,'2026-05-03 17:20:49','2026-05-03 17:20:49'),(4,'Khách Hàng DEMO','customer@a.com','0988888888','$2a$10$fAlah95cSp6Lk0Ddm/elS.uh7omwNY33.TfPE3ABHDTKeeVUKpqDK','customer',1,'2026-05-03 17:20:49','2026-05-03 17:20:49'),(5,'Michael Le','staff3@a.com','0901112223','$2a$10$fAlah95cSp6Lk0Ddm/elS.uh7omwNY33.TfPE3ABHDTKeeVUKpqDK','staff',1,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(6,'Emily Pham','staff4@a.com','0903334445','$2a$10$fAlah95cSp6Lk0Ddm/elS.uh7omwNY33.TfPE3ABHDTKeeVUKpqDK','staff',1,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(7,'David Vu','staff5@a.com','0905556667','$2a$10$fAlah95cSp6Lk0Ddm/elS.uh7omwNY33.TfPE3ABHDTKeeVUKpqDK','staff',1,'2026-05-03 18:04:01','2026-05-03 18:04:01'),(8,'Kim Bang','nguyen@gmail.com','0867809347','$2a$10$EwPYsnSxGBAphiNZj7bmnOOoM5OrHrdCQ1OYmNYqSxl2Nb3GvCB6W','customer',1,'2026-06-18 12:22:25','2026-06-18 12:22:25');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-18 19:39:11
