As part of our accessibility (a11y) remediation initiative, we've identified a set of issues that can be resolved without requiring code deployment. We can begin addressing these items right away.

Below is a summary of the issue groups along with guidance for remediation. I've also prepared a worksheet with separate tabs for each issue type. These sheets include all relevant cases and can be used to track our progress.
General Notes on the Worksheet

    Column D: Links to SI page reports, where you can review each issue in its live context.

    Column G: Links to the corresponding Author pages for applying fixes.

    Columns I–K: For tracking remediation progress.

1. Table Cell Missing Context

Issue: Affected tables use <td> elements for the first cell in each row, which lacks semantic context.
Fix: Replace the first <td> in each affected row with a <th> element.
2. Empty Headings

Issue: Heading elements (e.g., <h1>, <h2>, etc.) are being misused for spacing purposes.
Fix:

    Locate the occurrence using the HTML editor on the Author page.

    Use DevTools (Styles tab) to determine the height of the heading used as a spacer.

    Replace the heading tag with a non-semantic <span> element.

    Apply the height as an inline line-height style using the style attribute in the <span>.
