import jsPDF from 'jspdf';

function splitTextToLines(doc, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = doc.getTextWidth(testLine);

    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function generateServicePDF(vehicle, services, companyData = null) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  if (companyData) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const rightMargin = pageWidth - margin;
    doc.text(companyData.name || '', rightMargin, yPos, { align: 'right' });
    yPos += 4;
    if (companyData.address) {
      doc.text(companyData.address, rightMargin, yPos, { align: 'right' });
      yPos += 4;
    }
    if (companyData.city) {
      doc.text(`${companyData.zipCode || ''} ${companyData.city}`, rightMargin, yPos, { align: 'right' });
      yPos += 4;
    }
    if (companyData.phone) {
      doc.text(`Tel: ${companyData.phone}`, rightMargin, yPos, { align: 'right' });
      yPos += 4;
    }
    yPos += 10;
  }

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Service-Nachweis', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');
  yPos += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Fahrzeugdaten', margin + 5, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Kennzeichen: ${vehicle.licensePlate}`, margin + 5, yPos);
  yPos += 5;
  doc.text(`Fahrzeug: ${vehicle.make} ${vehicle.model} (${vehicle.year})`, margin + 5, yPos);
  yPos += 5;
  doc.text(`Besitzer: ${vehicle.ownerName}`, margin + 5, yPos);
  yPos += 5;
  doc.text(`Aktueller KM-Stand: ${vehicle.currentKm.toLocaleString('de-DE')} km`, margin + 5, yPos);
  yPos += 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Service-Historie', margin, yPos);
  yPos += 10;

  if (!services || services.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Keine Service-Einträge vorhanden', margin, yPos);
  } else {
    services.forEach((service, index) => {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const serviceDate = new Date(service.date).toLocaleDateString('de-DE');
      doc.text(`${index + 1}. Service vom ${serviceDate}`, margin + 3, yPos);
      
      if (service.isTuv) {
        doc.setFillColor(34, 197, 94);
        doc.rect(pageWidth - margin - 25, yPos - 4, 23, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text('TÜV', pageWidth - margin - 13.5, yPos, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`KM-Stand: ${service.km.toLocaleString('de-DE')} km`, margin + 3, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descMaxWidth = (pageWidth - 2 * margin - 10) / 2;
      const descLines = splitTextToLines(doc, service.description, descMaxWidth);
      
      const leftColX = margin + 3;
      const rightColX = margin + 3 + descMaxWidth + 5;
      
      descLines.forEach((line, lineIndex) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }
        
        if (lineIndex % 2 === 0) {
          doc.text(line, leftColX, yPos);
        } else {
          doc.text(line, rightColX, yPos);
          yPos += 5;
        }
      });
      
      if (descLines.length % 2 !== 0) {
        yPos += 5;
      }
      
      yPos += 5;

      const laborCost = service.laborHours * service.laborRate;
      const totalCost = service.partsCost + laborCost;

      doc.setFontSize(9);
      doc.text(`Materialkosten: ${service.partsCost.toFixed(2)} EUR`, margin + 3, yPos);
      yPos += 4;
      doc.text(
        `Arbeitszeit: ${service.laborHours}h × ${service.laborRate} EUR/h = ${laborCost.toFixed(2)} EUR`,
        margin + 3,
        yPos
      );
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Gesamtkosten: ${totalCost.toFixed(2)} EUR`, margin + 3, yPos);
      yPos += 10;

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    });

    const totalServiceCost = services.reduce((sum, service) => {
      return sum + service.partsCost + service.laborHours * service.laborRate;
    }, 0);

    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }

    yPos += 5;
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(
      `Gesamtkosten aller Services: ${totalServiceCost.toFixed(2)} EUR`,
      margin + 5,
      yPos
    );
    doc.setTextColor(0, 0, 0);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  const footerText = `Erstellt am ${new Date().toLocaleDateString('de-DE')}`;
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  const fileName = `Service-Nachweis-${vehicle.licensePlate.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export function generateInvoicePDF(vehicle, services, companyData, invoiceNumber = null) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const invNumber = invoiceNumber || `R${Date.now()}`;
  const invDate = new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('RECHNUNG', margin, yPos);
  yPos += 25;

  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RECHNUNG AN:', leftColX, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(vehicle.ownerName.toUpperCase(), leftColX, yPos);
  yPos += 6;

  if (vehicle.ownerAddress) {
    doc.setFontSize(10);
    doc.text(vehicle.ownerAddress, leftColX, yPos);
    yPos += 5;
  }
  if (vehicle.ownerCity) {
    doc.text(`${vehicle.ownerZipCode || ''} ${vehicle.ownerCity}`, leftColX, yPos);
    yPos += 5;
  }

  let rightYPos = yPos - 18;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`RECHNUNG NR. ${invNumber}`, rightColX, rightYPos, { align: 'right' });
  rightYPos += 5;
  doc.text(invDate, rightColX, rightYPos, { align: 'right' });

  yPos += 15;

  if (companyData && companyData.name) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(companyData.name.toUpperCase(), pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (companyData.address) {
      doc.text(companyData.address, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
    }
    if (companyData.city) {
      doc.text(`${companyData.zipCode || ''} ${companyData.city}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
    }
    if (companyData.phone) {
      doc.text(`Tel: ${companyData.phone}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
    }
    if (companyData.email) {
      doc.text(companyData.email, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
    }
  }

  yPos += 20;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Beschreibung', margin + 3, yPos);
  doc.text('Anzahl', pageWidth - margin - 90, yPos, { align: 'right' });
  doc.text('Preis', pageWidth - margin - 50, yPos, { align: 'right' });
  doc.text('Summe', pageWidth - margin - 3, yPos, { align: 'right' });
  yPos += 10;

  // services als positionen
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let subtotal = 0;

  services.forEach((service, index) => {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
      
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Beschreibung', margin + 3, yPos);
      doc.text('Anzahl', pageWidth - margin - 90, yPos, { align: 'right' });
      doc.text('Preis', pageWidth - margin - 50, yPos, { align: 'right' });
      doc.text('Summe', pageWidth - margin - 3, yPos, { align: 'right' });
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
    }

    const serviceDate = new Date(service.date).toLocaleDateString('de-DE');
    
    const descMaxWidth = pageWidth - margin - 110;
    const descLines = splitTextToLines(doc, `${serviceDate} - ${service.description}`, descMaxWidth);
    
    descLines.forEach((line, lineIdx) => {
      doc.text(line, margin + 3, yPos);
      if (lineIdx < descLines.length - 1) yPos += 4;
    });

    if (service.partsCost > 0) {
      yPos += 5;
      doc.text('Material', margin + 8, yPos);
      doc.text('1', pageWidth - margin - 90, yPos, { align: 'right' });
      doc.text(`${service.partsCost.toFixed(2)}€`, pageWidth - margin - 50, yPos, { align: 'right' });
      doc.text(`${service.partsCost.toFixed(2)}€`, pageWidth - margin - 3, yPos, { align: 'right' });
      subtotal += service.partsCost;
    }

    if (service.laborHours > 0) {
      yPos += 5;
      doc.text(`Arbeitszeit (${service.laborHours}h)`, margin + 8, yPos);
      doc.text(service.laborHours.toString(), pageWidth - margin - 90, yPos, { align: 'right' });
      doc.text(`${service.laborRate.toFixed(2)}€`, pageWidth - margin - 50, yPos, { align: 'right' });
      const laborCost = service.laborHours * service.laborRate;
      doc.text(`${laborCost.toFixed(2)}€`, pageWidth - margin - 3, yPos, { align: 'right' });
      subtotal += laborCost;
    }

    yPos += 8;
    
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  });

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Zwischensumme', pageWidth - margin - 50, yPos);
  doc.text(`${subtotal.toFixed(2)}€`, pageWidth - margin - 3, yPos, { align: 'right' });
  yPos += 6;

  const taxRate = companyData?.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  doc.text(`Steuer (${taxRate}%)`, pageWidth - margin - 50, yPos);
  doc.text(`${taxAmount.toFixed(2)}€`, pageWidth - margin - 3, yPos, { align: 'right' });
  yPos += 10;

  const total = subtotal + taxAmount;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(pageWidth - margin - 60, yPos - 2, pageWidth - margin, yPos - 2);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Summe', pageWidth - margin - 50, yPos + 5);
  doc.text(`${total.toFixed(2)}€`, pageWidth - margin - 3, yPos + 5, { align: 'right' });
  yPos += 20;

  if (companyData && (companyData.bankName || companyData.iban)) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ZAHLUNGSINFORMATIONEN:', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (companyData.bankName) {
      doc.text(`Empfänger: ${companyData.bankName}`, margin, yPos);
      yPos += 5;
    }
    if (companyData.iban) {
      doc.text(`Kontonummer: ${companyData.iban}`, margin, yPos);
      yPos += 5;
    }
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  const footerText = `Rechnung erstellt am ${new Date().toLocaleDateString('de-DE')}`;
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  const fileName = `Rechnung-${invNumber}-${vehicle.licensePlate.replace(/\s/g, '-')}.pdf`;
  doc.save(fileName);
}
