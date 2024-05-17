async function fetchData(t1: any, fallback: any, calls: { key: any, call: Promise<any> }[]) {
    const promises = calls.map(call => call.call);
    try {
      //  console.log("========== ========= SSR CHECKPOINT 119:", new Date().getTime() - t1, "ms");
         
        const responses = await Promise.all(promises);
      //  console.log("========== ========= SSR CHECKPOINT 120:", new Date().getTime() - t1, "ms");
        for (let i = 0; i < calls.length; i++) {
            fallback[calls[i].key] = responses[i];
        //    console.log(`========== ========= SSR CHECKPOINT 12${i}:`, new Date().getTime() - t1, "ms");
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Rethrow or handle as appropriate
    }
    return fallback;
}
export default fetchData;