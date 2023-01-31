import { Card, Segmented, Space } from "antd";
import { useContext } from "react";

import { ThemeContext } from "../../theme/theme";

const OptionPage = () => {
  return (
    <ThemeContext.Customer>
      {(themeContext) => (
        <Space wrap>
          <Card title="主题" size="large" style={{ textAlign: "center" }}>
            <Segmented
              block
              size="large"
              options={[
                {
                  value: "light",
                  icon: <iconpark-icon name="light"></iconpark-icon>,
                },
                {
                  value: "dark",
                  icon: <iconpark-icon name="dark"></iconpark-icon>,
                },
                {
                  value: "auto",
                  icon: <iconpark-icon name="auto"></iconpark-icon>,
                },
              ]}
              onChange={(value) => {
                themeContext.themeMode = value;
              }}
            />
          </Card>
        </Space>
      )}
    </ThemeContext.Customer>
  );
};
export default OptionPage;
