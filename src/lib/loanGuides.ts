type LoanGuide = { heading: string; paragraphs: string[]; questions: { question: string; answer: string }[]; related: string[] };

export const LOAN_GUIDES: Record<string, LoanGuide> = {
  "personal-loan": {
    heading: "Planning a personal loan around your monthly budget",
    paragraphs: ["Start with the expense you need to cover and the amount you can set aside each month after your regular commitments. A loan enquiry is an opportunity to discuss your circumstances with our team; it is not a commitment to borrow.", "Bring details of your income and existing repayments to your assessment. Use our repayment calculator to compare amounts and tenures, then ask our staff to explain the actual repayment schedule and total amount payable before deciding."],
    questions: [
      { question: "Can I enquire online before visiting HMS Credit?", answer: "Yes. Use the short enquiry form on this page, or choose Myinfo on our application page. Our staff will contact you about the next step. Identity verification and completion take place at our Sim Lim Square office." },
      { question: "Does the calculator show an approved loan offer?", answer: "No. It estimates repayments from the values you enter. Eligibility, amount, rate and repayment terms are confirmed through an individual assessment." },
      { question: "What should I prepare for my visit?", answer: "Have your identification, proof of income and information about your current financial commitments ready. Our team will confirm which documents are needed for your circumstances." },
    ], related: ["foreigner-loan", "education-loan"],
  },
  "foreigner-loan": {
    heading: "Discussing a loan while working in Singapore",
    paragraphs: ["When you enquire, tell our team which pass you hold and the expense you need to cover. Your pass validity, employment and income form part of the assessment. Holding a particular pass does not by itself mean a loan will be approved.", "Prepare your identification and pass details, proof of employment and income, and information about your existing repayments. Our team will confirm the documents needed before your visit so you know what to bring."],
    questions: [
      { question: "Can Work Permit, S Pass and Employment Pass holders enquire?", answer: "Yes. HMS Credit accepts enquiries from these pass holders. Each application is assessed individually; enquiry submission does not guarantee eligibility or approval." },
      { question: "Do I need to visit the office?", answer: "Yes. You can start with an online enquiry, but verification and completion take place at HMS Credit, #01-08 Sim Lim Square." },
      { question: "Can I use the manual form instead of Myinfo?", answer: "Yes. The manual enquiry form is available even if you do not use Myinfo. Our staff will explain the supporting documents needed for assessment." },
    ], related: ["personal-loan", "education-loan"],
  },
  "wedding-loan": {
    heading: "Keep wedding costs and repayments in one plan",
    paragraphs: ["List the costs you still need to pay, such as venue deposits, photography and other arrangements, alongside their payment dates. This gives you a clearer amount to discuss with our team without treating your full wedding budget as the amount you need to borrow.", "Consider the monthly repayment alongside your household commitments after the wedding. Our calculator lets you explore different amounts and repayment periods; your assessment will determine the actual terms available."],
    questions: [
      { question: "What wedding expenses can I discuss with the team?", answer: "You can explain the wedding expenses you need help planning for, including deposits and outstanding vendor payments. Tell us the amount and timing when you enquire so the assessment reflects your circumstances." },
      { question: "Should I confirm a vendor payment before loan approval?", answer: "An enquiry or calculator estimate is not an approved loan offer. Do not treat it as confirmation that funds will be available for a vendor deadline." },
      { question: "How do I compare repayment options?", answer: "Use the loan calculator to estimate payments for different amounts and tenures. Before signing, ask our team to explain the actual rate, fees, repayment dates and total amount payable." },
    ], related: ["personal-loan", "education-loan"],
  },
  "business-loan": {
    heading: "Prepare a working-capital enquiry for your business",
    paragraphs: ["Describe what the funds are intended for, how much is needed and when the business expects to receive income. Examples include a stock purchase or a gap between supplier payments and customer receipts. A clear purpose helps our team understand the enquiry.", "Prepare information about business income and existing commitments. Consider quieter trading periods as well as expected sales when discussing repayment. Our team will confirm the documents needed to assess your particular business."],
    questions: [
      { question: "Can a sole proprietor make a business-loan enquiry?", answer: "Yes. Sole proprietors and small business owners can contact HMS Credit about working capital. Approval and terms depend on the individual assessment." },
      { question: "What business information should I have ready?", answer: "Prepare your business registration details, proof of business income and information about existing financial commitments. Staff will confirm any additional documents needed." },
      { question: "Is the calculator a business-loan quotation?", answer: "No. It provides an illustrative repayment estimate only. The assessment and terms explained by our staff determine any actual offer." },
    ], related: ["personal-loan", "education-loan"],
  },
  "education-loan": {
    heading: "Plan course costs alongside your existing commitments",
    paragraphs: ["Have the course fee breakdown and payment dates ready when you enquire. Explain whether you are studying full time or taking a course alongside work, and what income will be available during the repayment period.", "Include course-related expenses in your own budget and distinguish these from the amount you intend to request. An enquiry lets our team discuss the documents and assessment with you before you decide whether to proceed."],
    questions: [
      { question: "Can I enquire for a part-time course?", answer: "Yes. You can enquire about tuition, certification or upskilling costs, including part-time study. Your circumstances and ability to repay are assessed individually." },
      { question: "What course information should I prepare?", answer: "Have the course details, fee breakdown and payment schedule ready, together with identification and income information. Our staff will confirm the documents needed for assessment." },
      { question: "Does sending an enquiry commit me to a loan?", answer: "No. It asks our team to contact you. Review any offered terms, fees and repayment schedule before deciding whether to sign an agreement." },
    ], related: ["personal-loan", "foreigner-loan"],
  },
};
