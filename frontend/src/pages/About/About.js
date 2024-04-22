import React, {useState} from 'react'
import classes from './About.module.css'

export default function About() {
    const [activeTab, setActiveTab] = useState('Education');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

const renderEducationTimeline = () => {
    if ( activeTab === 'Education') {
        return (
            <div className={classes.education_timeline}>
            {/* Education Timeline Item 1 */}
                <div className={classes.timeline_item}>
                    <h3>University of Windsor, <br/>Windsor, Ontario</h3>
                    <p>Bachelor of Computer Science</p>
                    <p>2018 - 2023</p>
                </div>
                <div className={classes.timeline_item}>
                    <h3>Columbia International College,<br /> Hamilton, Ontario.</h3>
                    <p>12th Grade</p>
                    <p>2017-2018</p>
                </div>
                <div className={classes.timeline_item}>
                    <h3>Trinity International College,<br /> Lagos State, Nigeria.</h3>
                    <p>High school</p>
                    <p>2014-2017</p>
                </div>
                <div className={classes.timeline_item}>
                    <h3>Corona Secondary School,<br /> Ogun State, Nigeria.</h3>
                    <p>High School</p>
                    <p>2010-2014</p>
                </div>
            </div>
        );
    } else {
      return null; 
    }
};


    return (
            <div className={classes.About}>
                <div className={classes.About_content}>
                    <h1>
                        About Me
                    </h1>
                    <h2>
                        Summary
                    </h2>
                    <p>
                        I am a 23 year old, Computer Science graduate at the University of Windsor, driven by a passion for software development, web development, data science, and data analytics. With a keen interest in building websites and exploring their inner workings, I am motivated by the ability to create engaging online experiences and have full control over their functionality. <br/>
                            <br/>
                        Outside of coding, I am a very enthusiastic sports fan majorly soccer but not limited to it, being recently interested in NFL and basketball. I am an avid Manchester United fan. My love for the sport meant that i was getting more invested in the intricate details and data surrounding the sport which gave birth to my interest in data analytics and I have been striving to get better so I can understand the sport better and also further my knowledge of data analysis. <br/>
                            <br/>
                        As the world continues to embrace artificial intelligence and machine learning, I am excited to expand my expertise in these areas. The rapid emergence of AI has piqued my interest, and I am determined to enhance my knowledge and skills in this evolving field. I believe that leveraging AI technologies will play a vital role in shaping the future, and I am eager to contribute to its development.
                            <br/>                
                        With a strong foundation in computer science, a passion for software development, and a growing interest in data analytics and AI, I am eager to embark on a career that allows me to leverage my skills and contribute to meaningful projects. I am enthusiastic about opportunities to collaborate, learn from industry professionals, and make a positive impact in the world of technology. <br/>
                    </p>
                        <div className={classes.interests}>
                            <h2>Interests</h2>
                                <div className={classes.interests_content}>
                                    <p>
                                        My main interests are in Web Development, Data Science, Data Analytics, Machine Learning, Artificial Intelligence.
                                            <br/>
                                        In my spare time I have a couple hobbies that keep me occupied.
                                            <li>I am a sports fanatic and I support Manchester United, and dabble in sports analytics</li>
                                            <li>I am a huge movie buff and I love watching movies.</li>
                                            <li>I recently dabbled into writing because I want to share my thoughts and you can check me out on <a target="_blank"  href="https://medium.com/@cartierkuti" rel="noreferrer">medium</a> if you are interested in that</li>
                                            <li>I am a huge video game fan and I love playing video games.</li>
                                            <li>I take pictures from time to time capturing moments. Check out my <a target="_blank" href="https://www.instagram.com/cartierkuti/" rel="noreferrer">Instagram!</a></li>
                                    </p>
                                </div>
                        </div>
                        <div className={classes.education}>
                            <div className={classes.tabs}>
                                <button
                                className={
                                    activeTab === 'Education' ? classes.activeTab : ''
                                }
                                onClick={() => handleTabClick('Education')}
                                >
                                Education
                                </button>
                                <button
                                className={activeTab === 'Skills' ? classes.activeTab : ''}
                                onClick={() => handleTabClick('Skills')}
                                >
                                Skills
                                </button>
                            </div>
                            {renderEducationTimeline()}
                            </div>
                        </div>
                        </div>
  );
    
}