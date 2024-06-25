export const delay = (ms: number) => new Promise(

	resolve => {
		console.log("heello");
		setTimeout(resolve, ms)
	}
);


