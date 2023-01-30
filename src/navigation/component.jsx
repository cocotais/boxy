import { Button, Modal, Popover } from "antd";
import { useState } from "react";

import icon from "../icon/logo/boxy.svg";

const Dialog = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    props.hide();
    setTimeout(setIsModalOpen, 100, true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <Button type="text" style={{ width: 128, textAlign: "left" }} onClick={showModal}>
        {props.name}
      </Button>
      <Modal title={props.name} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        {props.content}
      </Modal>
    </>
  );
};

const Function = (props) => {
  const onTrigger = () => {
    props.hide();
    setTimeout(props.onClick, 100);
  };
  return (
    <>
      <Button type="text" style={{ width: 128, textAlign: "left" }} onClick={onTrigger}>
        {props.name}
      </Button>
    </>
  );
};

export const NavigationMenu = (props) => {
  const [open, setOpen] = useState(false);
  const hide = () => {
    setOpen(false);
  };
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };
  const generateContent = () => {
    let menu = [];
    for (let i in props.content) {
      if (props.content[i].mode === "dialog") {
        menu.push(
          <Dialog hide={hide} key={2 * i} name={props.content[i].name} content={props.content[i].content}></Dialog>
        );
      } else if (props.content[i].mode === "function") {
        menu.push(
          <Function hide={hide} key={2 * i} name={props.content[i].name} onClick={props.content[i].onClick}></Function>
        );
      }
      menu.push(<br key={2 * i + 1} />);
    }
    return <>{menu}</>;
  };
  return (
    <>
      <Popover
        arrowPointAtCenter
        placement="rightTop"
        content={generateContent()}
        trigger="hover"
        open={open}
        onOpenChange={handleOpenChange}
      >
        <img id="navigation" src={icon} alt="Logo" />
      </Popover>
    </>
  );
};
