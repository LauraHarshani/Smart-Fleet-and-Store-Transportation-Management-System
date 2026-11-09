import jsPDF from "jspdf";

export const generateBookingPDF = (booking) => {
  if (!booking) {
    console.error("No booking selected.");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const forest = [23, 63, 53];
  const green = [39, 134, 106];
  const lightGreen = [232, 242, 236];
  const gray = [100, 116, 139];
  const dark = [31, 41, 55];
  const lightGray = [241, 244, 242];

  let y = 18;

  // Helper: add a section heading
  const addSectionHeading = (title) => {
    checkPageSpace(14);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...forest);
    doc.text(title.toUpperCase(), margin, y);

    y += 3;

    doc.setDrawColor(220, 232, 224);
    doc.line(margin, y, pageWidth - margin, y);

    y += 8;
  };

  // Helper: check page space
  const checkPageSpace = (requiredHeight) => {
    if (y + requiredHeight > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // Helper: add label and value
  const addField = (label, value, x, fieldY, width) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(label, x, fieldY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...dark);

    const lines = doc.splitTextToSize(
      String(value || "Not available"),
      width
    );

    doc.text(lines, x, fieldY + 5);

    return lines.length;
  };

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  doc.setFillColor(...forest);
  doc.roundedRect(
    margin,
    y,
    contentWidth,
    27,
    3,
    3,
    "F"
  );

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("LogiFleet", margin + 7, y + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Fleet & Store Transportation Management",
    margin + 7,
    y + 18
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(
    "BOOKING DETAILS",
    pageWidth - margin - 7,
    y + 14,
    { align: "right" }
  );

  y += 36;

  // --------------------------------------------------
  // BOOKING INFORMATION
  // --------------------------------------------------

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...dark);
  doc.text(booking.id, margin, y);

  const statusText = booking.status || "Pending";

  doc.setFontSize(8);
  doc.setTextColor(...green);
  doc.text(
    statusText.toUpperCase(),
    pageWidth - margin,
    y,
    { align: "right" }
  );

  y += 9;

  addField(
    "CREATED DATE",
    booking.createdAt,
    margin,
    y,
    75
  );

  addField(
    "PRIORITY",
    booking.priority,
    margin + 82,
    y,
    45
  );

  addField(
    "DELIVERY TYPE",
    booking.deliveryType,
    margin + 135,
    y,
    45
  );

  y += 17;

  // --------------------------------------------------
  // ROUTE AND STORE DETAILS
  // --------------------------------------------------

  addSectionHeading("Route & Store Information");

  const halfWidth = (contentWidth - 8) / 2;

  const pickupLines = doc.splitTextToSize(
    booking.pickupStore || "Not available",
    halfWidth - 10
  );

  const destinationLines = doc.splitTextToSize(
    booking.destinationStore || "Not available",
    halfWidth - 10
  );

  const addressPickup = doc.splitTextToSize(
    booking.pickupAddress || "Not available",
    halfWidth - 10
  );

  const addressDestination = doc.splitTextToSize(
    booking.destinationAddress || "Not available",
    halfWidth - 10
  );

  const routeBoxHeight =
    Math.max(
      pickupLines.length + addressPickup.length,
      destinationLines.length + addressDestination.length
    ) * 4 + 17;

  checkPageSpace(routeBoxHeight + 5);

  const boxY = y;

  // Pickup box
  doc.setFillColor(...lightGray);
  doc.roundedRect(
    margin,
    boxY,
    halfWidth,
    routeBoxHeight,
    2,
    2,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...green);
  doc.text("PICKUP STORE", margin + 5, boxY + 7);

  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.text(pickupLines, margin + 5, boxY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(
    addressPickup,
    margin + 5,
    boxY + 14 + pickupLines.length * 4.5
  );

  // Destination box
  const destinationX = margin + halfWidth + 8;

  doc.setFillColor(...lightGray);
  doc.roundedRect(
    destinationX,
    boxY,
    halfWidth,
    routeBoxHeight,
    2,
    2,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...green);
  doc.text("DESTINATION STORE", destinationX + 5, boxY + 7);

  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.text(destinationLines, destinationX + 5, boxY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(
    addressDestination,
    destinationX + 5,
    boxY + 14 + destinationLines.length * 4.5
  );

  y += routeBoxHeight + 10;

  // --------------------------------------------------
  // SCHEDULE DETAILS
  // --------------------------------------------------

  addSectionHeading("Transport Schedule");

  const scheduleFields = [
    {
      label: "REQUESTED PICKUP",
      value: `${booking.date || ""}, ${booking.scheduledTime || ""}`.trim(),
    },
    {
      label: "EXPECTED DELIVERY",
      value: booking.expectedDelivery || "To be confirmed",
    },
    {
      label: "ESTIMATED DISTANCE",
      value: booking.distance || "Not available",
    },
    {
      label: "ESTIMATED TRANSIT",
      value: booking.transitTime || "Not available",
    },
  ];

  const scheduleGap = 5;
  const scheduleWidth = (contentWidth - scheduleGap) / 2;

  scheduleFields.forEach((field, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);

    const x = margin + column * (scheduleWidth + scheduleGap);
    const fieldY = y + row * 18;

    doc.setFillColor(...lightGreen);
    doc.roundedRect(
      x,
      fieldY,
      scheduleWidth,
      15,
      2,
      2,
      "F"
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(field.label, x + 4, fieldY + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...forest);

    const lines = doc.splitTextToSize(
      String(field.value),
      scheduleWidth - 8
    );

    doc.text(lines.slice(0, 2), x + 4, fieldY + 11);
  });

  y += 43;

  // --------------------------------------------------
  // ITEM BREAKDOWN
  // --------------------------------------------------

  addSectionHeading("Item Breakdown & Payload");

  const columns = {
    item: margin + 3,
    quantity: margin + 113,
    weight: pageWidth - margin - 3,
  };

  const drawTableHeader = () => {
    doc.setFillColor(...forest);
    doc.rect(margin, y - 4, contentWidth, 9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text("ITEM DESCRIPTION", columns.item, y + 2);
    doc.text("QUANTITY", columns.quantity, y + 2);
    doc.text("WEIGHT", columns.weight, y + 2, {
      align: "right",
    });

    y += 10;
  };

  drawTableHeader();

  (booking.items || []).forEach((item, index) => {
    const nameLines = doc.splitTextToSize(
      item.name || "Unnamed item",
      95
    );

    const descriptionLines = doc.splitTextToSize(
      item.description || "",
      95
    );

    const rowHeight = Math.max(
      13,
      nameLines.length * 4 +
        descriptionLines.length * 3.5 + 5
    );

    checkPageSpace(rowHeight + 5);

    // Repeat table heading after page break
    if (y === 18) {
      drawTableHeader();
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 249);
      doc.rect(
        margin,
        y - 4,
        contentWidth,
        rowHeight,
        "F"
      );
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(nameLines, columns.item, y + 1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(
      descriptionLines,
      columns.item,
      y + 1 + nameLines.length * 4
    );

    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(
      String(item.quantity || "-"),
      columns.quantity,
      y + 1
    );

    doc.setFont("helvetica", "bold");
    doc.text(
      String(item.weight || "-"),
      columns.weight,
      y + 1,
      { align: "right" }
    );

    y += rowHeight;
  });

  // --------------------------------------------------
  // CARGO TOTAL
  // --------------------------------------------------

  checkPageSpace(20);

  doc.setFillColor(...lightGreen);
  doc.roundedRect(
    margin,
    y,
    contentWidth,
    12,
    2,
    2,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...forest);

  doc.text(
    `TOTAL ITEMS: ${booking.totalItems ?? "-"}`,
    margin + 4,
    y + 7.5
  );

  doc.text(
    `TOTAL WEIGHT: ${booking.weight || "-"}`,
    pageWidth - margin - 4,
    y + 7.5,
    { align: "right" }
  );

  y += 20;

  // --------------------------------------------------
  // REVIEWER NOTE
  // --------------------------------------------------

  if (booking.reviewerNote) {
    addSectionHeading("Reviewer Handling Note");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);

    const noteLines = doc.splitTextToSize(
      booking.reviewerNote,
      contentWidth - 8
    );

    checkPageSpace(noteLines.length * 5 + 8);

    doc.text(noteLines, margin + 3, y);
    y += noteLines.length * 5 + 8;
  }

  // --------------------------------------------------
  // FOOTER ON EVERY PAGE
  // --------------------------------------------------

  const pageCount = doc.internal.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    doc.setDrawColor(220, 232, 224);
    doc.line(
      margin,
      pageHeight - 13,
      pageWidth - margin,
      pageHeight - 13
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...gray);

    doc.text(
      "LogiFleet | Booking Details",
      margin,
      pageHeight - 8
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  // Download PDF
  doc.save(`LogiFleet-${booking.id}.pdf`);
};
