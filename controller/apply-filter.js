const XLSX = require('xlsx');
const path = require('path')

async function processFile(file, filters) {
	try {

		const workbook = XLSX.readFile(file);

		// Get the first sheet
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		// Convert the worksheet to JSON
		const jsonData = XLSX.utils.sheet_to_json(worksheet);

		const filteredData = jsonData.filter(row => {
			// Check if the "Lineitem name" contains the product name from filters
			const hasProductName = filters.productName ? row['Lineitem name'].toLowerCase().includes(filters.productName.toLowerCase()) : true;

			// Check if the row has "Billing Phone" if filters.includePhoneNo is set to 'true'
			const hasBillingPhone = filters.includePhoneNo ? row['Billing Phone'] : true;

			// Return true if both conditions are met
			return hasProductName && hasBillingPhone;
		});

		// Step 3: Modify the data
		filteredData.forEach((row, index) => {
			// Add a new column with some data (e.g., "New Column" with a static value)
			const phoneNumber = row['Billing Phone'];
			const itemName = row['Lineitem name'];
			const itemPrice = row['Lineitem price'];
			const wp_link = `https://wa.me/${phoneNumber}?text=Complete%20your%20purchase%20of%20${encodeURIComponent(itemName)}%20-%20₹${itemPrice}`;


			row['WhatsApp Link'] = wp_link;
		});

		// Step 4: Convert the modified JSON back to a worksheet
		const newWorksheet = XLSX.utils.json_to_sheet(filteredData);

		// Step 5: Create a new workbook and add the new worksheet
		const newWorkbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'wp_updated_sheet');

		// Step 6: Write the new workbook to a file
		XLSX.writeFile(newWorkbook, path.join(process.env.BASE_API_URL, 'uploads', 'output.xlsx')); // Replace 'output.xlsx' with your desired output file name

		console.log('New Excel file created successfully.');
	}
	catch (e) {
		console.log("ERROR OCCURED", e)
	}
}

module.exports = { processFile };