const output = document.getElementById("output");
const input = document.getElementById("cli-input");

let currentState = "main";
let electricityRate = null;
let currentWatts = 0;
let appliances = [];
let currentAppliance = {};

const commands = {
  help: () => `Available commands:<br>
    1. help - Show this help message<br>
    2. learn - Learn about electricity usage<br>
    3. estimate - Estimate appliance power usage<br>
    4. calculate - Calculate household energy consumption<br>
    5. bill - Calculate your monthly electricity bill<br>
    6. rate - Set the electricity rate<br>
    7. tips - Get energy-saving tips`,

  learn: () => `Electricity usage is measured in kilowatt-hours (kWh).<br>
    1 kWh = 1000 watts used for 1 hour.<br>
    For example, a 100W light bulb used for 10 hours consumes 1 kWh.`,

  estimate: () => {
    currentState = "estimate";
    return `Enter the wattage of your appliance:`;
  },

  calculate: () => {
    currentState = "calculate";
    appliances = [];
    return `To calculate your household energy consumption enter the wattage of your appliance:`;
  },

  bill: () => {
    if (electricityRate === null) {
      currentState = "rate";
      return `Please set the electricity rate first. Enter the new electricity rate in $/kWh:`;
    }
    currentState = "bill";
    return `Enter your monthly electricity usage in kWh:`;
  },

  rate: () => {
    currentState = "rate";
    return `Enter the new electricity rate in $/kWh:`;
  },

  tips: () => `Energy-saving tips:<br>
    1. Use LED light bulbs<br>
    2. Unplug devices when not in use<br>
    3. Use energy-efficient appliances<br>
    4. Adjust thermostat settings<br>
    5. Improve home insulation`,
};

function processCommand(cmd) {
  cmd = cmd.toLowerCase().trim();
  if (currentState === "main") {
    if (commands[cmd]) {
      return commands[cmd]();
    } else if (cmd === "1") {
      return commands.help();
    } else if (cmd === "2") {
      return commands.learn();
    } else if (cmd === "3") {
      return commands.estimate();
    } else if (cmd === "4") {
      return commands.calculate();
    } else if (cmd === "5") {
      return commands.bill();
    } else if (cmd === "6") {
      return commands.rate();
    } else if (cmd === "7") {
      return commands.tips();
    } else {
      return `Unknown command: ${cmd}. Type 'help' for available commands.`;
    }
  } else if (currentState === "estimate") {
    return estimateAppliance(cmd);
  } else if (currentState === "estimateHours") {
    return estimateUsage(cmd);
  } else if (currentState === "calculate") {
    if (cmd === "done") {
      return handleCalculateDone(cmd);
    }
    return addApplianceWattage(cmd);
  } else if (currentState === "calculateHours") {
    return addApplianceHours(cmd);
  } else if (currentState === "calculateDone") {
    return handleCalculateDone(cmd);
  } else if (currentState === "bill") {
    return calculateBill(cmd);
  } else if (currentState === "rate") {
    return setElectricityRate(cmd);
  }
}

function estimateAppliance(wattage) {
  const watts = parseFloat(wattage);
  if (isNaN(watts)) {
    return "Please enter a valid number for wattage.";
  }
  currentWatts = watts;
  currentState = "estimateHours";
  return `Enter the number of hours the ${watts}W appliance is used per day:`;
}

function estimateUsage(hours) {
  const hrs = parseFloat(hours);
  if (isNaN(hrs)) {
    return "Please enter a valid number for hours.";
  }
  const kwhPerDay = (currentWatts * hrs) / 1000;
  currentState = "main";
  return `Your ${currentWatts}W appliance used for ${hrs} hours per day consumes ${kwhPerDay.toFixed(
    2
  )} kWh per day.`;
}

function addApplianceWattage(wattage) {
  const watts = parseFloat(wattage);
  if (isNaN(watts)) {
    return "Please enter a valid number for wattage.";
  }
  currentAppliance = { watts };
  currentState = "calculateHours";
  return `Enter the number of hours the ${watts}W appliance is used per day:`;
}

function addApplianceHours(hours) {
  const hrs = parseFloat(hours);
  if (isNaN(hrs)) {
    return "Please enter a valid number for hours.";
  }
  currentAppliance.hours = hrs;
  appliances.push(currentAppliance);
  currentState = "calculate";
  return `Appliance added. Enter the wattage of your next appliance or type 'done' to finish:`;
}

function calculateTotalUsage() {
  let totalKwhPerDay = 0;
  appliances.forEach((appliance) => {
    totalKwhPerDay += (appliance.watts * appliance.hours) / 1000;
  });
  return totalKwhPerDay;
}

function handleCalculateDone(cmd) {
  if (cmd === "done") {
    const totalUsage = calculateTotalUsage();
    currentState = "calculateDone";
    return `Your total daily usage is ${totalUsage.toFixed(
      2
    )} kWh. Would you like to estimate your monthly bill? (yes/no)`;
  } else if (cmd === "yes") {
    if (electricityRate === null) {
      currentState = "rate";
      return `Please set the electricity rate first. Enter the new electricity rate in $/kWh:`;
    }
    const totalUsage = calculateTotalUsage();
    const monthlyUsage = totalUsage * 30;
    const bill = monthlyUsage * electricityRate;
    currentState = "main";
    return `Your estimated monthly electricity bill is $${bill.toFixed(2)}.`;
  } else if (cmd === "no") {
    currentState = "main";
    return `Calculation complete. Type 'help' for available commands.`;
  } else {
    return `Unknown command: ${cmd}. Type 'help' for available commands.`;
  }
}

function calculateBill(usage) {
  const kWh = parseFloat(usage);
  if (isNaN(kWh)) {
    return "Please enter a valid number for kWh usage.";
  }
  const bill = kWh * electricityRate;
  currentState = "main";
  return `Your estimated monthly electricity bill for ${kWh} kWh is $${bill.toFixed(
    2
  )}.`;
}

function setElectricityRate(rate) {
  const newRate = parseFloat(rate);
  if (isNaN(newRate)) {
    return "Please enter a valid number for the electricity rate.";
  }
  electricityRate = newRate;

  // Store the previous state before entering rate setting
  const previousState = currentState === "rate" ? "main" : currentState;

  // Handle different scenarios based on where we came from
  switch (previousState) {
    case "main":
      currentState = "main";
      return `The new electricity rate is set to $${electricityRate.toFixed(
        2
      )} per kWh.`;

    case "calculateDone":
      // Continue with bill calculation after setting rate
      const totalUsage = calculateTotalUsage();
      const monthlyUsage = totalUsage * 30;
      const bill = monthlyUsage * electricityRate;
      currentState = "main";
      return `The new electricity rate is set to $${electricityRate.toFixed(
        2
      )} per kWh. Your estimated monthly electricity bill is $${bill.toFixed(
        2
      )}.`;

    case "bill":
      // Return to bill calculation
      currentState = "bill";
      return `The electricity rate is now set to $${electricityRate.toFixed(
        2
      )} per kWh. Please enter your monthly electricity usage in kWh:`;

    default:
      currentState = "main";
      return `The new electricity rate is set to $${electricityRate.toFixed(
        2
      )} per kWh.`;
  }
}
function displayWelcomeMessage() {
  output.innerHTML += `<div>Welcome to the Electricity Usage Estimator CLI!</div>`;
  output.innerHTML += `<div>${commands.help()}</div>`;
}

if (input) {
  input.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      const cmd = this.value.trim();
      if (cmd) {
        output.innerHTML += `<div>> ${cmd}</div>`;
        output.innerHTML += `<div>${processCommand(cmd)}</div>`;
      } else {
        output.innerHTML += `<div>> </div>`;
        output.innerHTML += `<div>Please enter a command. Type 'help' for available commands.</div>`;
      }
      this.value = "";
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  document.addEventListener("click", function () {
    input.focus();
  });

  // Display welcome message and ensure the input is focused when the page loads
  window.onload = function () {
    displayWelcomeMessage();
    input.focus();
  };
}

module.exports = { processCommand };
