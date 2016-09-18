import {ViewSlot} from 'aurelia-framework';

let currentZIndex = 1040;
let transitionEvent = (function () {
  let t;
  let el = document.createElement('fakeelement');

  let transitions = {
    'transition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'MozTransition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd'
  };

  for (t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
})();

function getNextZIndex() {
  return ++currentZIndex;
}

export let globalSettings = {
  lock: true,
  centerHorizontalOnly: false,
  isDraggable: true
};

export class DialogRenderer {
  defaultSettings = globalSettings;

  constructor() {
    this.dialogControllers = [];
    document.addEventListener('keyup', e => {
      if (e.keyCode === 27) {
        let top = this.dialogControllers[this.dialogControllers.length - 1];
        if (top && top.settings.lock !== true) {
          top.cancel();
        }
      }
    });
  }

  createDialogHost(dialogController) {
    let settings = dialogController.settings;
    let body = document.body;
    let modalOverlay = undefined;
    let documentMouseMoveListener = undefined;
    let documentMouseUpListener = undefined;

    if (settings.isModal) {
      modalOverlay = document.createElement('ai-dialog-overlay');
      modalOverlay.style.zIndex = getNextZIndex();
      document.body.appendChild(modalOverlay);
    }

    let modalContainer = document.createElement('ai-dialog-container');
    modalContainer.style.zIndex = getNextZIndex();
    document.body.appendChild(modalContainer);

    dialogController.slot = new ViewSlot(modalContainer, true);
    dialogController.slot.add(dialogController.view);

    dialogController.showDialog = () => {
      this.dialogControllers.push(dialogController);

      dialogController.slot.attached();
      dialogController.centerDialog();

      if (settings.isModal) {
        modalOverlay.onclick = () => {
          if (!settings.lock) {
            dialogController.cancel();
          } else {
            return false;
          }
        };
      }

      modalContainer.onmousedown = ((event) => {
        modalContainer.style.zIndex = getNextZIndex();
      }).bind(this);

      if (settings.isDraggable === true) {
        const modalHeader = modalContainer.firstElementChild.firstElementChild;
        modalHeader.classList.add('draggable');
        modalHeader.onmousedown = ((event) => {
          modalContainer.classList.add('dragging');
          event.preventDefault();
        }).bind(this);

        this.previousMouseEvent = undefined;

        documentMouseMoveListener = ((event) => {
          let dragging = modalContainer.classList.contains('dragging');
          if (dragging) {
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;

            const modalContainerRect = modalContainer.getBoundingClientRect();
            const topPosition = modalContainerRect.top;
            const leftPosition = modalContainerRect.left;
            const bottomPosition = topPosition + modalContainerRect.height;
            const rightPosition = leftPosition + modalContainerRect.width;

            const movementX = event.movementX || (this.previousMouseEvent !== undefined ? event.screenX - this.previousMouseEvent.screenX : 0);
            const movementY = event.movementY || (this.previousMouseEvent !== undefined ? event.screenY - this.previousMouseEvent.screenY : 0);

            let topPositionToBe = topPosition + movementY;
            let leftPositionToBe = leftPosition + movementX;
            let bottomPositionToBe = bottomPosition + movementY;
            let rightPositionToBe = rightPosition + movementX;

            let stopDragging = false;

            // if the dialog is out of screen or will move out of screen, place it on the edge of the screen
            if (bottomPosition > windowHeight || bottomPositionToBe > windowHeight) {
              topPositionToBe = windowHeight - modalContainerRect.height;
              stopDragging = true;
            }

            if (topPosition < 0 || topPositionToBe < 0) {
              topPositionToBe = 0;
              stopDragging = true;
            }

            if (leftPosition < 0 || leftPositionToBe < 0) {
              leftPositionToBe = 0;
              stopDragging = true;
            }

            if (rightPosition > windowWidth || rightPositionToBe > windowWidth) {
              leftPositionToBe = windowWidth - modalContainerRect.width;
              stopDragging = true;
            }

            modalContainer.style.top = topPositionToBe + 'px';
            modalContainer.style.left = leftPositionToBe + 'px';
            this.previousMouseEvent = event;

            if (stopDragging) {
              modalContainer.classList.remove('dragging');
              this.previousMouseEvent = undefined;
            }
          }
        }).bind(this);

        document.addEventListener('mousemove', documentMouseMoveListener);

        documentMouseUpListener = (() => {
          modalContainer.classList.remove('dragging');
          this.previousMouseEvent = undefined;
        }).bind(this);

        document.addEventListener('mouseup', documentMouseUpListener);
      }

      return new Promise((resolve) => {
        modalContainer.addEventListener(transitionEvent, onTransitionEnd);

        function onTransitionEnd(e) {
          if (e.target !== modalContainer) {
            return;
          }
          modalContainer.removeEventListener(transitionEvent, onTransitionEnd);
          resolve();
        }

        if (settings.isModal) {
          modalOverlay.classList.add('active');
        }
        modalContainer.classList.add('active');
        body.classList.add('ai-dialog-open');
      });
    };

    dialogController.hideDialog = () => {
      let i = this.dialogControllers.indexOf(dialogController);
      if (i !== -1) {
        this.dialogControllers.splice(i, 1);
      }

      return new Promise((resolve) => {
        modalContainer.addEventListener(transitionEvent, onTransitionEnd);

        function onTransitionEnd() {
          modalContainer.removeEventListener(transitionEvent, onTransitionEnd);
          resolve();
        }

        if (settings.isModal) {
          modalOverlay.classList.remove('active');
        }

        modalContainer.classList.remove('active');

        if (this.dialogControllers.length === 0) {
          body.classList.remove('ai-dialog-open');
        }
      });
    };

    dialogController.destroyDialogHost = () => {
      if (settings.isModal) {
        document.body.removeChild(modalOverlay);
      }
      document.body.removeChild(modalContainer);
      if (settings.isDraggable) {
        document.removeEventListener('mousemove', documentMouseMoveListener);
        document.removeEventListener('mouseup', documentMouseUpListener);
      }

      dialogController.slot.detached();
      return Promise.resolve();
    };

    dialogController.centerDialog = () => {
      let child = modalContainer.children[0];
      let windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

      const modalContainerWidth = child.offsetWidth + 10;
      if ((windowWidth - modalContainerWidth) > 0) {
        modalContainer.style.width = modalContainerWidth + 'px';
      } else {
        modalContainer.style.width = (windowWidth - 50) + 'px';
      }

      modalContainer.style.left = ((windowWidth - modalContainer.offsetWidth) / 2) + 'px';

      if (!settings.centerHorizontalOnly) {
        const modalContainerHeight = child.offsetHeight + 10;
        let windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if ((windowHeight - modalContainerHeight) > 0) {
          modalContainer.style.top = Math.max((windowHeight - modalContainerHeight) / 2, 30) + 'px';
        } else {
          modalContainer.style.top = '30px';
          let header = child.children[0];
          let body = child.children[1];
          let footer = child.children[2];
          child.style.height = (windowHeight - 50) + 'px';
          body.style.height = (windowHeight - 50 - header.offsetHeight - footer.offsetHeight) + 'px';
          body.style.overflow = 'auto';
        }
      } else {
        modalContainer.style.top = '5px';
      }
    };

    return Promise.resolve();
  }

  showDialog(dialogController) {
    return dialogController.showDialog();
  }

  hideDialog(dialogController) {
    return dialogController.hideDialog();
  }

  destroyDialogHost(dialogController) {
    return dialogController.destroyDialogHost();
  }
}
