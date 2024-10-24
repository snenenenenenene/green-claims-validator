import React from 'react';
import { useStores } from '@/hooks/useStores';

const DeleteConfirmationModal: React.FC = () => {
	const { chartStore, modalStore, utilityStore } = useStores();

	const currentInstance = chartStore.chartInstances.find(
		instance => instance.id === utilityStore.currentTab
	);

	const handleConfirmDelete = () => {
		if (currentInstance) {
			chartStore.deleteTab(currentInstance.id);
			modalStore.closeModal();
			utilityStore.setCurrentTab('');  // Reset the current tab
		}
	};

	const handleCancel = () => {
		modalStore.closeModal();
	};

	if (!modalStore.isModalOpen || !currentInstance) {
		return null;
	}

	return (
		<dialog open className="modal">
			<div className="modal-box">
				<h3 className="text-lg font-bold">Confirm Delete</h3>
				<p>Are you sure you want to delete the tab "{currentInstance.name}"?</p>
				<div className="mt-4 flex justify-end space-x-2">
					<button
						className="btn"
						onClick={handleCancel}
					>
						Cancel
					</button>
					<button
						className="btn btn-error"
						onClick={handleConfirmDelete}
					>
						Delete
					</button>
				</div>
			</div>
		</dialog>
	);
};

export default DeleteConfirmationModal;