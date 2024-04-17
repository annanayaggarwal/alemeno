exports.calculateApprovedLimit = (monthlyIncome) => {
    return Math.round(36 * monthlyIncome / 100000) * 100000; // Rounded to nearest lakh
  };
  