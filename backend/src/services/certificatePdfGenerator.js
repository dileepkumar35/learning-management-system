const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a digital signature for the certificate
 * In production, this should use proper PKI/digital signature standards
 */
const generateDigitalSignature = (certificateData) => {
  const dataString = JSON.stringify({
    certificateId: certificateData.certificateId,
    studentName: certificateData.studentName,
    courseTitle: certificateData.courseTitle,
    issuedAt: certificateData.issuedAt,
  });
  
  // Create a hash-based signature (in production, use proper digital signatures)
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'default-secret')
    .update(dataString)
    .digest('hex');
  
  return signature;
};

/**
 * Generate a verification token
 */
const generateVerificationToken = (certificate) => {
  const payload = {
    certificateId: certificate.certificateId,
    verificationCode: certificate.verificationCode,
    timestamp: Date.now(),
  };
  
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

/**
 * Generate PDF certificate
 */
const generateCertificatePDF = async (certificateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Collect PDF data in chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Generate digital signature
      const digitalSignature = generateDigitalSignature(certificateData);
      
      // Generate verification token
      const verificationToken = generateVerificationToken(certificateData);

      // Generate QR code for verification
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificateData.certificateId}?token=${verificationToken}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 150,
        margin: 1,
        color: { dark: '#232536', light: '#ffffff' }
      });

      // Draw decorative border
      doc
        .rect(30, 30, pageWidth - 60, pageHeight - 60)
        .lineWidth(3)
        .strokeColor('#FFD700')
        .stroke();

      doc
        .rect(40, 40, pageWidth - 80, pageHeight - 80)
        .lineWidth(1)
        .strokeColor('#232536')
        .stroke();

      // Add decorative corner elements
      const cornerSize = 40;
      // Top-left corner
      doc.moveTo(50, 50).lineTo(50 + cornerSize, 50).stroke();
      doc.moveTo(50, 50).lineTo(50, 50 + cornerSize).stroke();
      // Top-right corner
      doc.moveTo(pageWidth - 50, 50).lineTo(pageWidth - 50 - cornerSize, 50).stroke();
      doc.moveTo(pageWidth - 50, 50).lineTo(pageWidth - 50, 50 + cornerSize).stroke();
      // Bottom-left corner
      doc.moveTo(50, pageHeight - 50).lineTo(50 + cornerSize, pageHeight - 50).stroke();
      doc.moveTo(50, pageHeight - 50).lineTo(50, pageHeight - 50 - cornerSize).stroke();
      // Bottom-right corner
      doc.moveTo(pageWidth - 50, pageHeight - 50).lineTo(pageWidth - 50 - cornerSize, pageHeight - 50).stroke();
      doc.moveTo(pageWidth - 50, pageHeight - 50).lineTo(pageWidth - 50, pageHeight - 50 - cornerSize).stroke();

      // Add logo/header text
      doc
        .fontSize(28)
        .fillColor('#232536')
        .font('Helvetica-Bold')
        .text('CERTIFICATE', 0, 80, { align: 'center' });

      doc
        .fontSize(16)
        .fillColor('#667eea')
        .font('Helvetica')
        .text('OF COMPLETION', 0, 115, { align: 'center' });

      // Award icon (trophy/star representation with text)
      doc
        .fontSize(40)
        .fillColor('#FFD700')
        .text('★', 0, 145, { align: 'center' });

      // "This certifies that" text
      doc
        .fontSize(14)
        .fillColor('#64748b')
        .font('Helvetica')
        .text('This is to certify that', 0, 200, { align: 'center' });

      // Student name
      doc
        .fontSize(32)
        .fillColor('#232536')
        .font('Helvetica-Bold')
        .text(certificateData.studentName, 0, 230, { align: 'center' });

      // Underline for name
      const nameWidth = doc.widthOfString(certificateData.studentName);
      const nameX = (pageWidth - nameWidth) / 2;
      doc
        .moveTo(nameX, 268)
        .lineTo(nameX + nameWidth, 268)
        .strokeColor('#FFD700')
        .lineWidth(2)
        .stroke();

      // "has successfully completed" text
      doc
        .fontSize(14)
        .fillColor('#64748b')
        .font('Helvetica')
        .text('has successfully completed the course', 0, 290, { align: 'center' });

      // Course title
      doc
        .fontSize(24)
        .fillColor('#667eea')
        .font('Helvetica-Bold')
        .text(certificateData.courseTitle, 100, 320, {
          align: 'center',
          width: pageWidth - 200
        });

      // Grade (if available)
      if (certificateData.grade) {
        doc
          .fontSize(14)
          .fillColor('#10b981')
          .font('Helvetica-Bold')
          .text(`Final Grade: ${certificateData.grade}%`, 0, 370, { align: 'center' });
      }

      // Date information
      const completionDate = new Date(certificateData.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const issuedDate = new Date(certificateData.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc
        .fontSize(12)
        .fillColor('#64748b')
        .font('Helvetica')
        .text(`Completed on ${completionDate}`, 0, 410, { align: 'center' });

      doc
        .fontSize(11)
        .fillColor('#94a3b8')
        .text(`Issued on ${issuedDate}`, 0, 430, { align: 'center' });

      // Signature line
      const signatureY = pageHeight - 180;
      const leftSignatureX = 150;
      const rightSignatureX = pageWidth - 250;

      // Left signature (Instructor/Authority)
      doc
        .moveTo(leftSignatureX, signatureY)
        .lineTo(leftSignatureX + 150, signatureY)
        .strokeColor('#232536')
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(12)
        .fillColor('#232536')
        .font('Helvetica-Bold')
        .text('Course Instructor', leftSignatureX, signatureY + 10, { width: 150, align: 'center' });

      // Right section - QR Code and verification
      const qrX = rightSignatureX + 25;
      const qrY = signatureY - 70;

      // Add QR code
      doc.image(qrCodeDataUrl, qrX, qrY, { width: 100, height: 100 });

      doc
        .fontSize(9)
        .fillColor('#64748b')
        .font('Helvetica')
        .text('Scan to verify', qrX, qrY + 110, { width: 100, align: 'center' });

      // Certificate details at bottom
      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .font('Helvetica')
        .text(`Certificate ID: ${certificateData.certificateId}`, 60, pageHeight - 80);

      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .text(`Verification Code: ${certificateData.verificationCode}`, 60, pageHeight - 65);

      // Digital signature hash (first 32 chars)
      doc
        .fontSize(7)
        .fillColor('#cbd5e1')
        .text(`Digital Signature: ${digitalSignature.substring(0, 32)}...`, 60, pageHeight - 50);

      // Footer
      doc
        .fontSize(9)
        .fillColor('#64748b')
        .font('Helvetica-Oblique')
        .text(
          'This certificate validates the successful completion of the course requirements.',
          0,
          pageHeight - 35,
          { align: 'center' }
        );

      // Watermark
      doc
        .fontSize(60)
        .fillColor('#f9fafb')
        .opacity(0.1)
        .text('VERIFIED', 0, pageHeight / 2 - 50, {
          align: 'center',
          rotate: -45
        });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateCertificatePDF,
  generateDigitalSignature,
  generateVerificationToken
};
