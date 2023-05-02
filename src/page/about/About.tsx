import { Typography } from "antd";
import React from "react";
import "./About.css"
const { Paragraph} = Typography;


const About: React.FC = (props) => {
  return (
    <div className="about-container">
      <div className="about-intro">
      <p>欢迎来到我们的证件照制作网站！我们专门为您提供高品质的证件照制作服务，让您快速便捷地获取您所需要的各种证件照。</p>

      <p>我们的网站拥有全球领先的证件照制作技术和领先的人工智能智能化算法，能够保证您的证件照质量高、速度快、服务优质。</p>

      <p>我们的证件照制作网站提供多种证件照设计，在制作证件照时，我们会根据您需求的证件类型，提供不同的证件照模板，如身份证、护照、驾驶证等。您可以在我们的网站上选择您需要的证件照模板，然后上传您的照片，我们能够自动编辑好您所需要的证件照。</p>

      <p>我们的证件照制作网站还提供证件照的打印和邮寄服务，让您完全不用出门就可以得到高质量的证件照。</p>

      <p>我们的网站所有的证件照都严格按照国家的证件照标准制作，不会出现任何问题或不合法的情况。</p>

      <p>感谢您选择我们的证件照制作网站，我们将全力为您提供最优质的服务！</p>
      </div>
    </div>
  );
}

export default About;