package com.sovereign.service;

import com.sovereign.entity.Creator;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Phase 12 (Prompt 14) — PDF Pitch Generator.
 * Creates a professional pitch deck mock using Apache PDFBox, drawing text to a byte array.
 */
@Service
public class PdfGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(PdfGeneratorService.class);

    public byte[] generatePitchPdf(Creator creator, String brandIndustry, String aiRationale) {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Header
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 24);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("Creator Partnership Pitch: " + creator.getName());
                contentStream.endText();

                // Subtitle
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE), 14);
                contentStream.newLineAtOffset(50, 670);
                contentStream.showText("Prepared for the " + brandIndustry + " Industry - " + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
                contentStream.endText();

                // Metrics block
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
                contentStream.newLineAtOffset(50, 600);
                contentStream.showText("Creator Metrics");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 575);
                contentStream.showText("Primary Niche: " + creator.getNiche());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Conversion Rate: " + creator.getConversionRate() + "%");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Avg Engagement Rate: " + creator.getAvgEngagementRate() + "%");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Top Platform: " + creator.getTopPlatform());
                contentStream.endText();

                // AI Match Rationale
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
                contentStream.newLineAtOffset(50, 460);
                contentStream.showText("Why This Match Works");
                contentStream.endText();

                // Simple word wrap simulation (just breaking by manual offset for mock purposes)
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(50, 435);
                
                String[] words = aiRationale.split(" ");
                StringBuilder line = new StringBuilder();
                for (String word : words) {
                    if (line.length() + word.length() > 80) {
                        contentStream.showText(line.toString());
                        contentStream.newLineAtOffset(0, -15);
                        line = new StringBuilder();
                    }
                    line.append(word).append(" ");
                }
                if (!line.isEmpty()) {
                    contentStream.showText(line.toString());
                }
                contentStream.endText();
            }

            document.save(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Failed to generate PDF pitch", e);
            throw new RuntimeException("Could not generate PDF", e);
        }
    }
}
