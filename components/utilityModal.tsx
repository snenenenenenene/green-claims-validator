import React from "react";
import useStore from "@/lib/store";

const UtilityModal = () => {
	const { modalContent, isModalOpen, closeModal } = useStore((state) => ({
		modalContent: state.modalContent,
		isModalOpen: state.isModalOpen,
		closeModal: state.closeModal,
	}));

	if (!isModalOpen || !modalContent) {
		return null; // Return nothing if the modal is not open or there's no content
	}

	return (
		<dialog id="utility_modal" className="modal modal-open">
			<div className="modal-box">
				{modalContent}
				<div className="modal-action">
					<button className="btn" onClick={closeModal}>
						Close
					</button>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop" onClick={closeModal}>
				<button type="button">Close</button>
			</form>
		</dialog>
	);
};

export default UtilityModal;
