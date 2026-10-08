import PDFDocument from "pdfkit";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyCertificate = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  const enrollment = await Enrollment.findOne({
    certificateCode: code.toUpperCase().trim(),
    status: "completed",
  })
    .populate("student", "name avatarUrl")
    .populate("course", "title slug thumbnailUrl mentor")
    .populate({
      path: "course",
      populate: { path: "mentor", select: "name mentorProfile" },
    })
    .lean();

  if (!enrollment) {
    return next(
      new AppError(404, "Invalid certificate code or certificate not found.")
    );
  }

  res.status(200).json({
    success: true,
    data: {
      certificateCode: enrollment.certificateCode,
      studentName: enrollment.student?.name,
      courseTitle: enrollment.course?.title,
      courseSlug: enrollment.course?.slug,
      mentorName: enrollment.course?.mentor?.name,
      completedAt: enrollment.completedAt,
      enrolledAt: enrollment.enrolledAt,
    },
  });
});

export const downloadCertificatePdf = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  const enrollment = await Enrollment.findOne({
    certificateCode: code.toUpperCase().trim(),
    status: "completed",
  })
    .populate("student", "name")
    .populate("course", "title mentor")
    .populate({
      path: "course",
      populate: { path: "mentor", select: "name" },
    })
    .lean();

  if (!enrollment) {
    return next(new AppError(404, "Invalid certificate code or certificate not found."));
  }

  // Set the headers to trigger a download in the browser
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Certificate_${code.toUpperCase()}.pdf`
  );

  // Initialize PDF
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  // Pipe directly to the response object
  doc.pipe(res);

  // 1. Draw Background & Borders
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8fafc"); // Very light blue/gray background
  
  // Outer Border (Dark Blue)
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(10).stroke("#1e3a8a");
  
  // Inner Border (Gold)
  doc.rect(36, 36, doc.page.width - 72, doc.page.height - 72).lineWidth(3).stroke("#fbbf24");

  // Corner Accents (Gold)
  // Top Left
  doc.polygon([20, 20], [60, 20], [20, 60]).fill("#fbbf24");
  // Top Right
  doc.polygon([doc.page.width - 20, 20], [doc.page.width - 60, 20], [doc.page.width - 20, 60]).fill("#fbbf24");
  // Bottom Left
  doc.polygon([20, doc.page.height - 20], [60, doc.page.height - 20], [20, doc.page.height - 60]).fill("#fbbf24");
  // Bottom Right
  doc.polygon([doc.page.width - 20, doc.page.height - 20], [doc.page.width - 60, doc.page.height - 20], [doc.page.width - 20, doc.page.height - 60]).fill("#fbbf24");

  // Watermark (subtle background text)
  doc.font("Helvetica-Bold").fontSize(110).fillColor("#e2e8f0").text("EDUVERSE", 0, doc.page.height / 2 - 60, { align: "center" });

  // Reset opacity/blend modes if needed, but fill overrides it

  // 2. Title & Header
  doc.font("Helvetica-Bold").fontSize(46).fillColor("#1e3a8a").text("CERTIFICATE OF COMPLETION", 0, 100, { align: "center" });
  
  doc.font("Helvetica").fontSize(14).fillColor("#d97706").text("PROUDLY PRESENTED TO", 0, 170, { align: "center", characterSpacing: 5 });

  // 3. Student Name (Fancy Font)
  const studentName = enrollment.student?.name || "Student";
  doc.font("Times-BoldItalic").fontSize(56).fillColor("#0f172a").text(studentName, 0, 220, { align: "center" });

  // Underline for name
  const textWidth = doc.widthOfString(studentName);
  doc.moveTo(doc.page.width / 2 - textWidth / 2 - 20, 280)
     .lineTo(doc.page.width / 2 + textWidth / 2 + 20, 280)
     .lineWidth(1)
     .stroke("#cbd5e1");

  // 4. Course Details
  doc.font("Helvetica").fontSize(16).fillColor("#475569").text("For successfully completing the comprehensive course:", 0, 310, { align: "center" });

  doc.font("Helvetica-Bold").fontSize(26).fillColor("#1e3a8a").text(enrollment.course?.title || "Course", 40, 350, { align: "center", width: doc.page.width - 80 });

  // 5. Bottom Signatures & Seal
  const bottomY = doc.page.height - 140;

  // Left side: Instructor Signature
  doc.font("Times-Italic").fontSize(26).fillColor("#0f172a").text(enrollment.course?.mentor?.name || "Eduverse Mentor", 100, bottomY - 15);
  doc.moveTo(90, bottomY + 20).lineTo(320, bottomY + 20).lineWidth(1).stroke("#94a3b8");
  doc.font("Helvetica").fontSize(12).fillColor("#64748b").text("Instructor Signature", 90, bottomY + 30, { width: 230, align: "center" });

  // Right side: Date & ID
  const dateStr = enrollment.completedAt
    ? new Date(enrollment.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString();
  
  doc.font("Helvetica").fontSize(16).fillColor("#0f172a").text(dateStr, doc.page.width - 320, bottomY, { align: "center", width: 230 });
  doc.moveTo(doc.page.width - 320, bottomY + 20).lineTo(doc.page.width - 90, bottomY + 20).lineWidth(1).stroke("#94a3b8");
  doc.font("Helvetica").fontSize(12).fillColor("#64748b").text("Date Completed", doc.page.width - 320, bottomY + 30, { align: "center", width: 230 });
  
  doc.fontSize(10).fillColor("#94a3b8").text(`ID: ${enrollment.certificateCode}`, doc.page.width - 320, bottomY + 60, { align: "center", width: 230 });

  // Draw Gold Seal in the Bottom Center
  const centerX = doc.page.width / 2;
  const centerY = bottomY + 15;

  // Seal Outer Circle
  doc.circle(centerX, centerY, 45).fill("#f59e0b");
  // Seal Inner Ring
  doc.circle(centerX, centerY, 38).lineWidth(2).stroke("#fef3c7");
  // Seal Text
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#fff").text("EDUVERSE", centerX - 35, centerY - 14, { width: 70, align: "center" });
  doc.font("Helvetica").fontSize(8).fillColor("#fef3c7").text("VERIFIED", centerX - 35, centerY + 4, { width: 70, align: "center" });

  doc.end();
});
