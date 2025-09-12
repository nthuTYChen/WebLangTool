export const addListeningTask = function(info) {
	// Only lecturer users are able to use this function
	if(info.user.type === 'lecturer') {
		// An upsert action
		listeningTasks.update({
			title: info.title,
			filename: info.filename
		},
		{
			$setOnInsert: {
				description: info.description,
				createdAt: new Date()
			}
		},
		{upsert: true});
	}
};